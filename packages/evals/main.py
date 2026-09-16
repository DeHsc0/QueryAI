from deepeval.dataset import EvaluationDataset 
from deepeval.dataset.golden import Golden
from deepeval.metrics import TaskCompletionMetric
from agent.init import get_llm , get_agent , Context
from deepeval.evaluate.configs import AsyncConfig, DisplayConfig
from agent.memory.short import get_checkpointer
from langchain.agents import create_agent 
from deepeval.metrics import FaithfulnessMetric , ToolCorrectnessMetric , AnswerRelevancyMetric , GEval
from deepeval.integrations.langchain import CallbackHandler
from dotenv import load_dotenv 
from langchain.messages import HumanMessage
import asyncio
from uuid import uuid4
load_dotenv()



data =[
  {
    "input": "I want to analyze how the Signal-to-Noise Quality Indicator (SNQI) varies across different weather conditions. For each weather condition, give weather condition name, the average SNQI, the median SNQI, and count how many analyzable signals there are. Sort the result by average SNQI in descending order.",
    "expected_output": {
      "sql": "WITH signal_quality AS (\n    SELECT \n        s.SignalRegistry,\n        s.SnrRatio - 0.1 * ABS(s.NoiseFloorDbm) AS SNQI,\n        o.WeathProfile\n    FROM Signals s\n    JOIN Telescopes t ON s.TelescRef = t.TelescRegistry\n    JOIN Observatories o ON t.ObservStation = o.ObservStation\n)\nSELECT \n    WeathProfile,\n    AVG(SNQI) AS avg_snqi,\n    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY SNQI) AS median_snqi,\n    COUNT(*) FILTER (WHERE SNQI > 0) AS analyzable_signals\nFROM signal_quality\nGROUP BY WeathProfile\nORDER BY avg_snqi DESC;",
      "insight": "Clear weather produces the highest average SNQI and the largest number of analyzable signals. Cloudy and partially cloudy conditions show noticeably lower signal quality and fewer usable detections."
    }
  },
  {
    "input": "Classify signals by TOLS Category, and for each group, show the category name, signal count, average Bandwidth-to-Frequency Ratio, and the standard deviation of the anomaly score.",
    "expected_output": {
      "sql": "SELECT \n    CASE \n        WHEN p.TechSigProb * (1 - p.NatSrcProb) * p.SigUnique * (0.5 + p.AnomScore/10) < 0.25 THEN 'Low'\n        WHEN p.TechSigProb * (1 - p.NatSrcProb) * p.SigUnique * (0.5 + p.AnomScore/10) < 0.75 THEN 'Medium'\n        ELSE 'High'\n    END AS tol_category,\n    COUNT(*) AS signal_count,\n    AVG(s.BwHz/(s.CenterFreqMhz * 1000000)) AS avg_bfr,\n    STDDEV(p.AnomScore) AS anomaly_stddev\nFROM Signals s\nJOIN SignalProbabilities p ON s.SignalRegistry = p.SignalRef\nGROUP BY tol_category;",
      "insight": "Most signals fall into the Medium TOLS category. High-TOLS signals tend to have narrower bandwidth-to-frequency ratios, which is consistent with potential technosignatures."
    }
  },
  {
    "input": "Analyze how lunar interference affects observations by showing the current moon phase, average Lunar Interference Factor (LIF) and the count of high lunar interference events for each observatory, sorted by average LIF in descending order.",
    "expected_output": {
      "sql": "SELECT \n    o.ObservStation,\n    o.LunarStage,\n    AVG((1 - o.LunarDistDeg/180) * (1 - o.AtmosTransparency)) AS avg_lif,\n    COUNT(*) FILTER (WHERE (1 - o.LunarDistDeg/180) * (1 - o.AtmosTransparency) > 0.5) AS high_interf_count\nFROM Observatories o\nGROUP BY o.ObservStation, o.LunarStage\nORDER BY avg_lif DESC;",
      "insight": "Observatories experiencing Full or Last Quarter phases show the highest average LIF and the most high-interference events. New-moon periods produce the cleanest data."
    }
  },
  {
    "input": "Which observatory stations are discovering the most potential technosignatures? For each station, display the observatory name, how many signals meet our technosignature criteria, their average TOLS score, average BFR values, and what percentage of all detected technosignatures they've found. Rank by the stations with the most discoveries first.",
    "expected_output": {
      "sql": "WITH tech_signals AS (\n    SELECT \n        s.SignalRegistry,\n        s.TelescRef,\n        p.TechSigProb * (1 - p.NatSrcProb) * p.SigUnique * (0.5 + p.AnomScore/10) AS TOLS,\n        s.BwHz/(s.CenterFreqMhz * 1000000) AS BFR\n    FROM Signals s\n    JOIN SignalProbabilities p ON s.SignalRegistry = p.SignalRef\n    WHERE p.TechSigProb > 0.7 \n      AND p.NatSrcProb < 0.3 \n      AND p.ArtSrcProb < 50\n      AND s.BwHz/(s.CenterFreqMhz * 1000000) < 0.001\n)\nSELECT \n    t.ObservStation,\n    COUNT(*) AS potential_tech_signals,\n    AVG(ts.TOLS) AS avg_tols,\n    AVG(ts.BFR) AS avg_bfr,\n    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tech_signals) AS percentage_of_total\nFROM tech_signals ts\nJOIN Telescopes t ON ts.TelescRef = t.TelescRegistry\nGROUP BY t.ObservStation\nORDER BY potential_tech_signals DESC;",
      "insight": "A small number of observatories account for the majority of potential technosignatures. Those stations also show higher average TOLS scores, suggesting they are more effective at detecting candidate artificial signals."
    }
  },
  {
    "input": "Show me a breakdown of signal modulation types that appear at least 5 times. For each type give the count, average Modulation Complexity Score (MCS), average SNR, and a JSON object mapping each signal ID to its MCS and SNR values.",
    "expected_output": {
      "sql": "SELECT \n    s.ModType,\n    COUNT(*) AS signal_count,\n    AVG(s.ModIndex * (1 + (1 - ABS(s.FreqDriftHzs)/(s.FreqMhz*1000)) * \n        s.SigDurSec/(1 + s.DoppShiftHz/1000)) *\n        CASE \n            WHEN s.ModType = 'AM' THEN 2\n            WHEN s.ModType = 'FM' THEN 1.5\n            ELSE 1\n        END) AS avg_mcs,\n    AVG(s.SnrRatio) AS avg_snr,\n    JSON_OBJECT_AGG(\n        s.SignalRegistry,\n        JSON_BUILD_OBJECT(\n            'mcs', s.ModIndex * (1 + (1 - ABS(s.FreqDriftHzs)/(s.FreqMhz*1000)) * \n                   s.SigDurSec/(1 + s.DoppShiftHz/1000)) *\n                   CASE \n                       WHEN s.ModType = 'AM' THEN 2\n                       WHEN s.ModType = 'FM' THEN 1.5\n                       ELSE 1\n                   END,\n            'snr', s.SnrRatio\n        )\n    ) AS signal_details\nFROM Signals s\nWHERE s.ModType IS NOT NULL\nGROUP BY s.ModType\nHAVING COUNT(*) >= 5;",
      "insight": "FM and Unknown modulation types dominate the dataset. FM signals tend to have higher average MCS, indicating more sophisticated modulation that may be worth deeper investigation."
    }
  },
  {
    "input": "Which observatories have the most promising signals? Show total signals, average Research Priority Index (RPI), approximate Confirmation Confidence Score, number of high-priority signals (RPI > 3), number of high-confidence signals, and how many meet both criteria. Sort by the combined high-priority + high-confidence count.",
    "expected_output": {
      "sql": "WITH priority_calc AS (\n    SELECT \n        t.ObservStation,\n        s.SignalRegistry,\n        (p.TechSigProb * 4 + p.BioSigProb/100 + p.SigUnique * 2 + p.AnomScore/2) * (1 - p.FalsePosProb) AS RPI,\n        (1 - p.FalsePosProb) * COALESCE(sd.DecodeConf, 50) * COALESCE(sc.ClassConf, 50) / 100.0 * \n            (CASE WHEN (s.SnrRatio - 0.1 * ABS(s.NoiseFloorDbm)) > 0 \n                  THEN (s.SnrRatio - 0.1 * ABS(s.NoiseFloorDbm))/10 + 0.5 \n                  ELSE 0.1 END) AS CCS_approx\n    FROM Signals s\n    JOIN SignalProbabilities p ON s.SignalRegistry = p.SignalRef\n    JOIN Telescopes t ON s.TelescRef = t.TelescRegistry\n    LEFT JOIN SignalDecoding sd ON s.SignalRegistry = sd.SignalRef\n    LEFT JOIN SignalClassification sc ON s.SignalRegistry = sc.SignalRef\n)\nSELECT \n    ObservStation,\n    COUNT(*) AS total_signals,\n    AVG(RPI) AS avg_rpi,\n    AVG(CCS_approx) AS avg_ccs,\n    COUNT(*) FILTER (WHERE RPI > 3) AS high_priority_signals,\n    COUNT(*) FILTER (WHERE CCS_approx > 0.8) AS high_confidence_signals,\n    COUNT(*) FILTER (WHERE RPI > 3 AND CCS_approx > 0.8) AS high_priority_high_confidence\nFROM priority_calc\nGROUP BY ObservStation\nORDER BY high_priority_high_confidence DESC;",
      "insight": "A few observatories stand out with both high average RPI and a non-trivial number of signals that simultaneously satisfy high-priority and high-confidence thresholds. These stations should be prioritized for follow-up observing time."
    }
  },
  {
    "input": "How does signal quality change with weather? Just give me the average quality and how many good signals we have for each weather type.",
    "expected_output": {
      "sql": "WITH signal_quality AS (\n    SELECT \n        s.SnrRatio - 0.1 * ABS(s.NoiseFloorDbm) AS SNQI,\n        o.WeathProfile\n    FROM Signals s\n    JOIN Telescopes t ON s.TelescRef = t.TelescRegistry\n    JOIN Observatories o ON t.ObservStation = o.ObservStation\n)\nSELECT \n    WeathProfile,\n    AVG(SNQI) AS avg_snqi,\n    COUNT(*) FILTER (WHERE SNQI > 0) AS analyzable_signals\nFROM signal_quality\nGROUP BY WeathProfile\nORDER BY avg_snqi DESC;",
      "insight": "Clear skies yield the best average signal quality and the highest count of analyzable detections. Degraded weather conditions produce both lower SNQI and fewer usable signals."
    }
  },
  {
    "input": "Show me the observatories that are seeing the most lunar interference right now.",
    "expected_output": {
      "sql": "SELECT \n    o.ObservStation,\n    o.LunarStage,\n    AVG((1 - o.LunarDistDeg/180) * (1 - o.AtmosTransparency)) AS avg_lif,\n    COUNT(*) FILTER (WHERE (1 - o.LunarDistDeg/180) * (1 - o.AtmosTransparency) > 0.5) AS high_interf_count\nFROM Observatories o\nGROUP BY o.ObservStation, o.LunarStage\nORDER BY avg_lif DESC\nLIMIT 5;",
      "insight": "The top observatories currently experience elevated Lunar Interference Factor values, especially during Full or Last Quarter phases. Scheduling observations around New Moon would reduce contamination."
    }
  }
]

import asyncio
from uuid import uuid4
from deepeval.dataset import EvaluationDataset
from deepeval.dataset.golden import Golden
from deepeval.metrics import TaskCompletionMetric, FaithfulnessMetric, AnswerRelevancyMetric, GEval
from deepeval.integrations.langchain import CallbackHandler
from dotenv import load_dotenv
from langchain.messages import HumanMessage
from agent.init import get_llm, get_agent, Context

load_dotenv()

dataset = EvaluationDataset(goldens=[Golden(input=data[0]["input"])])
sample_tenant_id = "user_3Hu8BOVwSh5Au9s8Pz7a0lx71AX__3ff2bd38-81fd-4b6c-8b0e-cc50c19a6232"


task_completion = TaskCompletionMetric(
    task="The task is to get the user the appropriate insight from his database by turning the natural language input into insight"
)

async def run_agent(prompt: str):
    # Prefer an in-memory checkpointer for evals – Redis often causes hangs
    # checkpointer = await get_checkpointer()
    from langgraph.checkpoint.memory import MemorySaver
    checkpointer = MemorySaver()

    agent = get_agent(checkpointer=checkpointer)

    config = {
        "callbacks": [CallbackHandler()],
        "configurable": {"thread_id": str(uuid4())},
    }

    result = await agent.ainvoke(
        {"messages": [HumanMessage(content=prompt)]},
        config=config,
        context=Context(
            tenant_id=sample_tenant_id,
            dense_schema=None,
            db_type=None,
            encrypted_creds=None,
        ),
    )
    return result


# ---------- evaluation loop ----------
# Force sync mode so DeepEval does not fight with asyncio
for golden in dataset.evals_iterator(
    metrics=[task_completion],
    async_config=AsyncConfig(run_async=False),
    display_config=DisplayConfig(show_indicator=True, verbose_mode=True),
):
    # Safe way to run an async function when there is no event loop yet
    asyncio.run(run_agent(golden.input))