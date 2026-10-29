import type { SampleCatalogEntry } from "./sample-catalog"

export const SAMPLE_CATALOG: readonly SampleCatalogEntry[] = [
  {
    id: "solar_panel",
    name: "Solar Panel Plants",
    domain: "Renewable energy / solar PV operations & maintenance",
    description: "Operations data for a fleet of utility-scale solar plants. Each plant is tracked through time-stamped snapshots covering electrical output, weather, mechanical condition, maintenance costs and alerts, alongside the panel models used and each site's warranty, insurance and compliance status.",
    engine: "PostgreSQL",
    source: {
      benchmark: "BIRD-Interact (full)",
      dataset_url: "https://huggingface.co/datasets/birdsql/bird-interact-full",
      folder: "solar_panel",
      paper: "https://arxiv.org/abs/2510.05318",
      license: "CC BY-SA 4.0",
      attribution: "BIRD Team & Google Cloud"
    },
    stats: {
      table_count: 10,
      jsonb_column_count: 3,
      knowledge_entry_count: 50,
      row_counts_note: "Row counts are null because the dump is not hosted on Hugging Face; fill after loading it."
    },
    what_you_can_ask: [
      "Plant reliability and downtime",
      "Degradation and ageing of panels",
      "Maintenance, cleaning and replacement costs",
      "Revenue loss and financial risk",
      "Soiling, temperature and weather impact on output",
      "Warranty, insurance and compliance risk",
      "Inspection and alert priorities"
    ],
    tables: [
      {
        name: "plants",
        role: "core entity",
        description: "One row per solar power plant (site): capacity, commissioning date, panel model, orientation, and warranty, insurance, compliance and environmental risk status.",
        primary_key: [
          "sitekey"
        ],
        columns: [
          {
            name: "sitekey",
            type: "text",
            description: "Unique plant identifier",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: "SP9227"
          },
          {
            name: "sitelabel",
            type: "text",
            description: "Plant name",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Solar Plant West Davidport"
          },
          {
            name: "cap_mw",
            type: "real",
            description: "Installed capacity in megawatts (MW)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 257.58
          },
          {
            name: "goliveon",
            type: "date",
            description: "Date the plant became operational",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "2018-02-28"
          },
          {
            name: "modhook",
            type: "text",
            description: "Panel model used at this plant",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "panel_models",
              column: "modkey"
            },
            example: "Model-102"
          },
          {
            name: "tiltdeg",
            type: "real",
            description: "Panel tilt angle from horizontal (degrees)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 1.2
          },
          {
            name: "azmdeg",
            type: "real",
            description: "Panel azimuth relative to true north (degrees)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 169.8
          },
          {
            name: "recyclenote",
            type: "text",
            description: "Panel recycling programme status. Null = not reported.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Available",
              "In Development"
            ]
          },
          {
            name: "docstate",
            type: "text",
            description: "Completeness of plant documentation",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Complete",
              "Missing",
              "Partial"
            ]
          },
          {
            name: "warrstate",
            type: "text",
            description: "Equipment warranty status. Null = not reported.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Active",
              "Claimed",
              "Expired"
            ]
          },
          {
            name: "warrclaims",
            type: "bigint",
            description: "Number of warranty claims made. Null = not reported.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              0,
              1,
              2,
              3,
              4,
              5
            ]
          },
          {
            name: "insurstate",
            type: "text",
            description: "Insurance coverage status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Covered",
              "Expired",
              "Partial"
            ]
          },
          {
            name: "complyflag",
            type: "text",
            description: "Regulatory compliance status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Compliant",
              "Non-Compliant",
              "Under Review"
            ]
          },
          {
            name: "envtag",
            type: "text",
            description: "Environmental risk/impact classification",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "High",
              "Low",
              "Medium"
            ]
          }
        ],
        sample_rows: [
          {
            sitekey: "SP9227",
            sitelabel: "Solar Plant West Davidport",
            cap_mw: 257.58,
            goliveon: "2018-02-28",
            modhook: "Model-102",
            tiltdeg: 1.2,
            azmdeg: 169.8,
            recyclenote: null,
            docstate: "Missing",
            warrstate: "Claimed",
            warrclaims: 2,
            insurstate: "Covered",
            complyflag: "Compliant",
            envtag: "High"
          },
          {
            sitekey: "SP6740",
            sitelabel: "Solar Plant Dillonmouth",
            cap_mw: 437.71,
            goliveon: "2023-08-06",
            modhook: "Model-892",
            tiltdeg: 13.1,
            azmdeg: 158.8,
            recyclenote: "In Development",
            docstate: "Missing",
            warrstate: "Active",
            warrclaims: 4,
            insurstate: "Covered",
            complyflag: "Non-Compliant",
            envtag: "Low"
          },
          {
            sitekey: "SP7738",
            sitelabel: "Solar Plant North Xavier",
            cap_mw: 397.96,
            goliveon: "2022-06-18",
            modhook: "Model-677",
            tiltdeg: 27.1,
            azmdeg: 223,
            recyclenote: "In Development",
            docstate: "Missing",
            warrstate: "Claimed",
            warrclaims: 2,
            insurstate: "Expired",
            complyflag: "Non-Compliant",
            envtag: "High"
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "modhook",
            references: {
              table: "panel_models",
              column: "modkey"
            }
          }
        ]
      },
      {
        name: "panel_models",
        role: "reference / lookup",
        description: "Catalogue of solar panel models: manufacturer, technology, rated power, efficiency, degradation rate and temperature behaviour.",
        primary_key: [
          "modkey"
        ],
        columns: [
          {
            name: "modkey",
            type: "text",
            description: "Unique panel model identifier",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: "Model-102"
          },
          {
            name: "makertag",
            type: "text",
            description: "Manufacturer. Null = not reported.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Canadian Solar",
              "JA Solar",
              "JinkoSolar",
              "Longi",
              "Trina"
            ]
          },
          {
            name: "pnlkind",
            type: "text",
            description: "Panel technology",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Bifacial",
              "HJT",
              "Mono-PERC",
              "Poly-PERC",
              "TOPCon"
            ]
          },
          {
            name: "rated_w",
            type: "real",
            description: "Rated maximum power under standard test conditions (W)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              450,
              500,
              550,
              600,
              650
            ]
          },
          {
            name: "effpct",
            type: "real",
            description: "Conversion efficiency (%)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 20.86
          },
          {
            name: "degyrrate",
            type: "real",
            description: "Specified annual power degradation rate (% per year)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 0.36
          },
          {
            name: "tempcoeff",
            type: "real",
            description: "Temperature coefficient of power (%/°C). Null = not reported.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: -0.389
          },
          {
            name: "nomoptempc",
            type: "text",
            description: "Nominal operating temperature, stored as text with unit",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "45.7 °C"
          }
        ],
        sample_rows: [
          {
            modkey: "Model-102",
            makertag: "Longi",
            pnlkind: "Mono-PERC",
            rated_w: 650,
            effpct: 20.86,
            degyrrate: 0.36,
            tempcoeff: -0.389,
            nomoptempc: "45.7 °C"
          },
          {
            modkey: "Model-892",
            makertag: null,
            pnlkind: "HJT",
            rated_w: 650,
            effpct: 21.65,
            degyrrate: 0.88,
            tempcoeff: -0.446,
            nomoptempc: "45.5 °C"
          },
          {
            modkey: "Model-677",
            makertag: "Longi",
            pnlkind: "Poly-PERC",
            rated_w: 450,
            effpct: 21.93,
            degyrrate: 0.94,
            tempcoeff: null,
            nomoptempc: "46.7 °C"
          }
        ],
        row_count: null,
        foreign_keys: []
      },
      {
        name: "plant_panel_model",
        role: "junction",
        description: "Link table between plants and panel models (which model each plant uses).",
        primary_key: [
          "sitelink",
          "modlink"
        ],
        columns: [
          {
            name: "sitelink",
            type: "text",
            description: "Plant",
            nullable: false,
            is_primary_key: true,
            foreign_key: {
              table: "plants",
              column: "sitekey"
            },
            example: "SP9227"
          },
          {
            name: "modlink",
            type: "text",
            description: "Panel model",
            nullable: false,
            is_primary_key: true,
            foreign_key: {
              table: "panel_models",
              column: "modkey"
            },
            example: "Model-102"
          }
        ],
        sample_rows: [
          {
            sitelink: "SP9227",
            modlink: "Model-102"
          },
          {
            sitelink: "SP6740",
            modlink: "Model-892"
          },
          {
            sitelink: "SP7738",
            modlink: "Model-677"
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "sitelink",
            references: {
              table: "plants",
              column: "sitekey"
            }
          },
          {
            column: "modlink",
            references: {
              table: "panel_models",
              column: "modkey"
            }
          }
        ]
      },
      {
        name: "plant_record",
        role: "snapshot hub",
        description: "One row per measurement snapshot of a plant at a point in time. Hub table: the electrical, environmental, mechanical, operational and alert tables all attach to it via snapkey.",
        primary_key: [
          "snapkey"
        ],
        columns: [
          {
            name: "snapkey",
            type: "text",
            description: "Unique snapshot identifier",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: "PV937101"
          },
          {
            name: "sitetie",
            type: "text",
            description: "Plant the snapshot belongs to",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "plants",
              column: "sitekey"
            },
            example: "SP9227"
          },
          {
            name: "snapts",
            type: "timestamp without time zone",
            description: "When the snapshot was taken",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "2018-08-03 12:21:20"
          }
        ],
        sample_rows: [
          {
            snapkey: "PV937101",
            sitetie: "SP9227",
            snapts: "2018-08-03 12:21:20"
          },
          {
            snapkey: "PV945724",
            sitetie: "SP6740",
            snapts: "2023-03-05 14:10:48"
          },
          {
            snapkey: "PV227567",
            sitetie: "SP7738",
            snapts: "2023-01-30 02:55:15"
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "sitetie",
            references: {
              table: "plants",
              column: "sitekey"
            }
          }
        ]
      },
      {
        name: "electrical_performance",
        role: "snapshot detail",
        description: "Electrical health of a snapshot in a single JSONB column: IV-curve parameters, inverter and grid metrics, efficiency losses and energy-yield KPIs.",
        primary_key: [
          "snaplink"
        ],
        columns: [
          {
            name: "snaplink",
            type: "text",
            description: "Snapshot (1:1 with plant_record)",
            nullable: false,
            is_primary_key: true,
            foreign_key: {
              table: "plant_record",
              column: "snapkey"
            },
            example: "PV937101"
          },
          {
            name: "elec_perf_snapshot",
            type: "jsonb",
            description: "Nested electrical performance data (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              efficiency: {
                description: "Efficiency and loss indicators",
                fields: [
                  {
                    name: "instant_eff_pct",
                    type: "REAL",
                    description: "Current operational efficiency (%)",
                    example: 18.54
                  },
                  {
                    name: "eff_loss_pct",
                    type: "REAL",
                    description: "Efficiency loss since installation (%)",
                    example: 2.32
                  },
                  {
                    name: "cumulative_deg_pct",
                    type: "REAL",
                    description: "Cumulative degradation since commissioning (%)",
                    example: 14.69
                  },
                  {
                    name: "soil_loss_pct",
                    type: "REAL",
                    description: "Power loss due to soiling (%)",
                    example: 13.41
                  },
                  {
                    name: "spectral_mismatch",
                    type: "TEXT",
                    description: "Spectral mismatch factor, stored as text with a % sign",
                    example: "100.50%"
                  }
                ]
              },
              power: {
                description: "Instantaneous power figures",
                fields: [
                  {
                    name: "power_now_w",
                    type: "REAL",
                    description: "Current power output (W). May be null.",
                    example: 554.51
                  },
                  {
                    name: "power_loss_w",
                    type: "REAL",
                    description: "Power lost since installation (W). May be null.",
                    example: 95.49
                  }
                ]
              },
              iv_curve: {
                description: "Current-voltage curve parameters, initial vs current",
                fields: [
                  {
                    name: "isc_initial_a",
                    type: "REAL",
                    description: "Initial short-circuit current (A)",
                    example: 9.09
                  },
                  {
                    name: "isc_now_a",
                    type: "REAL",
                    description: "Current short-circuit current (A)",
                    example: 8.51
                  },
                  {
                    name: "voc_initial_v",
                    type: "REAL",
                    description: "Initial open-circuit voltage (V). May be null.",
                    example: 49.74
                  },
                  {
                    name: "voc_now_v",
                    type: "REAL",
                    description: "Current open-circuit voltage (V)",
                    example: 43.32
                  },
                  {
                    name: "imp_initial_a",
                    type: "REAL",
                    description: "Initial current at max power point (A)",
                    example: 9.17
                  },
                  {
                    name: "imp_now_a",
                    type: "REAL",
                    description: "Current current at max power point (A). May be null.",
                    example: 7.21
                  },
                  {
                    name: "vmp_initial_v",
                    type: "REAL",
                    description: "Initial voltage at max power point (V)",
                    example: 38.48
                  },
                  {
                    name: "vmp_now_v",
                    type: "REAL",
                    description: "Current voltage at max power point (V)",
                    example: 36.98
                  },
                  {
                    name: "fill_factor_initial",
                    type: "REAL",
                    description: "Initial fill factor",
                    example: 0.773
                  },
                  {
                    name: "fill_factor_now",
                    type: "REAL",
                    description: "Current fill factor",
                    example: 0.71
                  },
                  {
                    name: "series_res_ohm",
                    type: "TEXT",
                    description: "Series resistance, stored as text with unit",
                    example: "0.17 Ω"
                  },
                  {
                    name: "shunt_res_ohm",
                    type: "REAL",
                    description: "Shunt resistance (ohm)",
                    example: 437.3
                  }
                ]
              },
              inverter: {
                description: "Inverter health",
                fields: [
                  {
                    name: "inverter_eff_pct",
                    type: "REAL",
                    description: "Inverter efficiency (%)",
                    example: 98.43
                  },
                  {
                    name: "power_factor",
                    type: "REAL",
                    description: "Inverter power factor. May be null.",
                    example: 0.979
                  },
                  {
                    name: "inverter_temp_c",
                    type: "REAL",
                    description: "Inverter operating temperature (°C)",
                    example: 49.1
                  }
                ]
              },
              grid: {
                description: "Grid connection quality",
                fields: [
                  {
                    name: "grid_voltage_v",
                    type: "REAL",
                    description: "Grid voltage (V). May be null.",
                    example: 226.9
                  },
                  {
                    name: "grid_frequency_hz",
                    type: "REAL",
                    description: "Grid frequency (Hz)",
                    example: 49.73
                  },
                  {
                    name: "power_quality_idx",
                    type: "REAL",
                    description: "Power quality index",
                    example: 0.467
                  },
                  {
                    name: "harmonic_distortion_pct",
                    type: "REAL",
                    description: "Total harmonic distortion (%)",
                    example: 4.01
                  },
                  {
                    name: "reactive_power_var",
                    type: "REAL",
                    description: "Reactive power (VAR). May be null.",
                    example: 33
                  }
                ]
              },
              energy_yield: {
                description: "Energy production KPIs",
                fields: [
                  {
                    name: "energy_yield_kwh",
                    type: "REAL",
                    description: "Energy yield for the snapshot (kWh)",
                    example: 15.64
                  },
                  {
                    name: "performance_ratio",
                    type: "REAL",
                    description: "Performance ratio. Frequently null.",
                    example: 0.846
                  },
                  {
                    name: "specific_yield_kwh_kw",
                    type: "REAL",
                    description: "Specific yield (kWh per kWp)",
                    example: 5.18
                  },
                  {
                    name: "capacity_factor_pct",
                    type: "REAL",
                    description: "Capacity factor (%)",
                    example: 27.47
                  },
                  {
                    name: "availability_pct",
                    type: "REAL",
                    description: "System availability (%)",
                    example: 97.73
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            snaplink: "PV937101",
            elec_perf_snapshot: {
              grid: {
                grid_voltage_v: null,
                grid_frequency_hz: 49.73,
                power_quality_idx: 0.467,
                reactive_power_var: 33,
                harmonic_distortion_pct: 4.01
              },
              power: {
                power_now_w: null,
                power_loss_w: null
              },
              inverter: {
                power_factor: 0.979,
                inverter_temp_c: 49.1,
                inverter_eff_pct: 98.43
              },
              iv_curve: {
                imp_now_a: 7.21,
                isc_now_a: 8.51,
                vmp_now_v: 36.98,
                voc_now_v: 43.32,
                imp_initial_a: 9.17,
                isc_initial_a: 9.09,
                shunt_res_ohm: 437.3,
                vmp_initial_v: 38.48,
                voc_initial_v: 49.74,
                series_res_ohm: "0.17 Ω",
                fill_factor_now: 0.71,
                fill_factor_initial: 0.773
              },
              efficiency: {
                eff_loss_pct: 2.32,
                soil_loss_pct: 13.41,
                instant_eff_pct: 18.54,
                spectral_mismatch: "100.50%",
                cumulative_deg_pct: 14.69
              },
              energy_yield: {
                availability_pct: 97.73,
                energy_yield_kwh: 15.64,
                performance_ratio: null,
                capacity_factor_pct: 27.47,
                specific_yield_kwh_kw: 5.18
              }
            }
          },
          {
            snaplink: "PV945724",
            elec_perf_snapshot: {
              grid: {
                grid_voltage_v: null,
                grid_frequency_hz: 49.6,
                power_quality_idx: 0.245,
                reactive_power_var: 65.1,
                harmonic_distortion_pct: 4.61
              },
              power: {
                power_now_w: 639.47,
                power_loss_w: 10.53
              },
              inverter: {
                power_factor: 0.985,
                inverter_temp_c: 51.2,
                inverter_eff_pct: 98.37
              },
              iv_curve: {
                imp_now_a: 7.3,
                isc_now_a: 8.41,
                vmp_now_v: 36.73,
                voc_now_v: 43.1,
                imp_initial_a: 9.93,
                isc_initial_a: 10.85,
                shunt_res_ohm: 880.7,
                vmp_initial_v: 38.25,
                voc_initial_v: null,
                series_res_ohm: "0.35 Ω",
                fill_factor_now: 0.788,
                fill_factor_initial: 0.775
              },
              efficiency: {
                eff_loss_pct: 1.7,
                soil_loss_pct: 11.27,
                instant_eff_pct: 19.95,
                spectral_mismatch: "99.60%",
                cumulative_deg_pct: 1.62
              },
              energy_yield: {
                availability_pct: 96.91,
                energy_yield_kwh: 340.32,
                performance_ratio: null,
                capacity_factor_pct: 25.37,
                specific_yield_kwh_kw: 6
              }
            }
          },
          {
            snaplink: "PV596868",
            elec_perf_snapshot: {
              grid: {
                grid_voltage_v: 220.8,
                grid_frequency_hz: 50.19,
                power_quality_idx: 0.26,
                reactive_power_var: null,
                harmonic_distortion_pct: 3.17
              },
              power: {
                power_now_w: null,
                power_loss_w: null
              },
              inverter: {
                power_factor: null,
                inverter_temp_c: 49,
                inverter_eff_pct: 97.74
              },
              iv_curve: {
                imp_now_a: null,
                isc_now_a: 8.39,
                vmp_now_v: 37.07,
                voc_now_v: 47.94,
                imp_initial_a: 9.49,
                isc_initial_a: 9.86,
                shunt_res_ohm: 998,
                vmp_initial_v: 36.44,
                voc_initial_v: null,
                series_res_ohm: "0.49 Ω",
                fill_factor_now: 0.764,
                fill_factor_initial: 0.812
              },
              efficiency: {
                eff_loss_pct: 3.5,
                soil_loss_pct: 10.87,
                instant_eff_pct: 17.82,
                spectral_mismatch: "98.70%",
                cumulative_deg_pct: 2.37
              },
              energy_yield: {
                availability_pct: 97.88,
                energy_yield_kwh: 1357.4,
                performance_ratio: null,
                capacity_factor_pct: 20.83,
                specific_yield_kwh_kw: 5.46
              }
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "snaplink",
            references: {
              table: "plant_record",
              column: "snapkey"
            }
          }
        ]
      },
      {
        name: "environmental_conditions",
        role: "snapshot detail",
        description: "Weather and atmospheric conditions at the time of a snapshot (JSONB): temperatures, irradiance, humidity, dust, wind, rain and snow.",
        primary_key: [
          "snapref"
        ],
        columns: [
          {
            name: "snapref",
            type: "text",
            description: "Snapshot (1:1 with plant_record)",
            nullable: false,
            is_primary_key: true,
            foreign_key: {
              table: "plant_record",
              column: "snapkey"
            },
            example: "PV937101"
          },
          {
            name: "env_snapshot",
            type: "jsonb",
            description: "Nested environmental data (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              temperatures: {
                description: "Temperatures",
                fields: [
                  {
                    name: "cell_temp_c",
                    type: "REAL",
                    description: "Solar cell temperature (°C). May be null.",
                    example: 47.3
                  },
                  {
                    name: "ambient_temp_c",
                    type: "REAL",
                    description: "Ambient air temperature (°C)",
                    example: 41.2
                  }
                ]
              },
              irradiance: {
                description: "Solar irradiance",
                fields: [
                  {
                    name: "ghi_w_m2",
                    type: "REAL",
                    description: "Global horizontal irradiance (W/m²). May be null.",
                    example: 530.4
                  },
                  {
                    name: "dni_w_m2",
                    type: "REAL",
                    description: "Direct normal irradiance (W/m²)",
                    example: 169.3
                  },
                  {
                    name: "dhi_w_m2",
                    type: "REAL",
                    description: "Diffuse horizontal irradiance (W/m²)",
                    example: 44.1
                  },
                  {
                    name: "poa_irr_w_m2",
                    type: "REAL",
                    description: "Plane-of-array irradiance (W/m²)",
                    example: 135.1
                  }
                ]
              },
              atmospheric: {
                description: "Atmospheric conditions",
                fields: [
                  {
                    name: "relative_humidity_pct",
                    type: "REAL",
                    description: "Relative humidity (%)",
                    example: 76.1
                  },
                  {
                    name: "air_pressure_hpa",
                    type: "REAL",
                    description: "Air pressure (hPa)",
                    example: 1099.2
                  },
                  {
                    name: "uv_index",
                    type: "REAL",
                    description: "UV index",
                    example: 1.1
                  },
                  {
                    name: "cloud_cover_pct",
                    type: "REAL",
                    description: "Cloud cover (%)",
                    example: 12.4
                  },
                  {
                    name: "dust_density_kg_m3",
                    type: "REAL",
                    description: "Dust density (kg/m³)",
                    example: 0.056
                  }
                ]
              },
              wind_rain_snow: {
                description: "Wind, rain and snow",
                fields: [
                  {
                    name: "wind_speed_m_s",
                    type: "REAL",
                    description: "Wind speed (m/s)",
                    example: 11.6
                  },
                  {
                    name: "wind_dir_deg",
                    type: "REAL",
                    description: "Wind direction (degrees)",
                    example: 249.3
                  },
                  {
                    name: "rain_mm",
                    type: "REAL",
                    description: "Rainfall (mm)",
                    example: 41.3
                  },
                  {
                    name: "snow_cover_pct",
                    type: "REAL",
                    description: "Snow cover (%)",
                    example: 24.8
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            snapref: "PV937101",
            env_snapshot: {
              irradiance: {
                dhi_w_m2: 44.1,
                dni_w_m2: 169.3,
                ghi_w_m2: null,
                poa_irr_w_m2: 135.1
              },
              atmospheric: {
                uv_index: 1.1,
                cloud_cover_pct: 12.4,
                air_pressure_hpa: 1099.2,
                dust_density_kg_m3: 0.056,
                relative_humidity_pct: 76.1
              },
              temperatures: {
                cell_temp_c: 47.3,
                ambient_temp_c: 41.2
              },
              wind_rain_snow: {
                rain_mm: 41.3,
                wind_dir_deg: 249.3,
                snow_cover_pct: 24.8,
                wind_speed_m_s: 11.6
              }
            }
          },
          {
            snapref: "PV945724",
            env_snapshot: {
              irradiance: {
                dhi_w_m2: 81.9,
                dni_w_m2: 686.2,
                ghi_w_m2: 556.4,
                poa_irr_w_m2: 500.1
              },
              atmospheric: {
                uv_index: 3.6,
                cloud_cover_pct: 93.8,
                air_pressure_hpa: 958.3,
                dust_density_kg_m3: 3.519,
                relative_humidity_pct: 50
              },
              temperatures: {
                cell_temp_c: 36.1,
                ambient_temp_c: 22.7
              },
              wind_rain_snow: {
                rain_mm: 36.2,
                wind_dir_deg: 29.8,
                snow_cover_pct: 59.7,
                wind_speed_m_s: 22.6
              }
            }
          },
          {
            snapref: "PV617932",
            env_snapshot: {
              irradiance: {
                dhi_w_m2: 21.4,
                dni_w_m2: 346.6,
                ghi_w_m2: null,
                poa_irr_w_m2: 224.8
              },
              atmospheric: {
                uv_index: 11,
                cloud_cover_pct: 43.7,
                air_pressure_hpa: 965.8,
                dust_density_kg_m3: 3.875,
                relative_humidity_pct: 70.8
              },
              temperatures: {
                cell_temp_c: null,
                ambient_temp_c: -1.6
              },
              wind_rain_snow: {
                rain_mm: 28.7,
                wind_dir_deg: 231.5,
                snow_cover_pct: 37.5,
                wind_speed_m_s: 11.3
              }
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "snapref",
            references: {
              table: "plant_record",
              column: "snapkey"
            }
          }
        ]
      },
      {
        name: "mechanical_condition",
        role: "snapshot detail",
        description: "Physical and mechanical health of the panels at a snapshot (JSONB): tracker state, module surface damage, electrical integrity and cleaning history.",
        primary_key: [
          "snapmk"
        ],
        columns: [
          {
            name: "snapmk",
            type: "text",
            description: "Snapshot (1:1 with plant_record)",
            nullable: false,
            is_primary_key: true,
            foreign_key: {
              table: "plant_record",
              column: "snapkey"
            },
            example: "PV937101"
          },
          {
            name: "mech_health_snapshot",
            type: "jsonb",
            description: "Nested mechanical condition data (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              tracker: {
                description: "Solar tracker status",
                fields: [
                  {
                    name: "tracker_state",
                    type: "TEXT",
                    description: "Tracking system operational status",
                    possible_values: [
                      "Error",
                      "Maintenance",
                      "Normal"
                    ]
                  },
                  {
                    name: "tracker_angle_deg",
                    type: "REAL",
                    description: "Tracker deviation angle (degrees)",
                    example: 20.5
                  }
                ]
              },
              module_surface: {
                description: "Physical condition of the module surface",
                fields: [
                  {
                    name: "backsheet_condition",
                    type: "TEXT",
                    description: "Backsheet condition",
                    possible_values: [
                      "Fair",
                      "Good",
                      "Poor"
                    ]
                  },
                  {
                    name: "glass_condition",
                    type: "TEXT",
                    description: "Front glass condition",
                    possible_values: [
                      "Clear",
                      "Damaged",
                      "Dusty"
                    ]
                  },
                  {
                    name: "encapsulant_yellowing",
                    type: "TEXT",
                    description: "Encapsulant yellowing. Null = not reported.",
                    possible_values: [
                      "Mild",
                      "Severe"
                    ]
                  },
                  {
                    name: "delamination_status",
                    type: "TEXT",
                    description: "Delamination status. Null = not reported.",
                    possible_values: [
                      "Major",
                      "Minor"
                    ]
                  },
                  {
                    name: "busbar_corrosion",
                    type: "TEXT",
                    description: "Busbar corrosion. Null = not reported.",
                    possible_values: [
                      "Severe",
                      "Visible"
                    ]
                  },
                  {
                    name: "hotspot_count",
                    type: "BIGINT",
                    description: "Number of detected hot spots. May be null.",
                    example: 1
                  },
                  {
                    name: "microcrack_count",
                    type: "BIGINT",
                    description: "Number of detected microcracks",
                    example: 7
                  },
                  {
                    name: "snail_trail_severity",
                    type: "TEXT",
                    description: "Snail trail severity. Null = not reported.",
                    possible_values: [
                      "Heavy",
                      "Light"
                    ]
                  },
                  {
                    name: "pid_severity",
                    type: "TEXT",
                    description: "Potential induced degradation severity. Null = not reported.",
                    possible_values: [
                      "High",
                      "Low"
                    ]
                  },
                  {
                    name: "lid_status",
                    type: "TEXT",
                    description: "Light-induced degradation status",
                    possible_values: [
                      "Ongoing",
                      "Stabilized",
                      "Unknown"
                    ]
                  }
                ]
              },
              electrical_integrity: {
                description: "Electrical safety components",
                fields: [
                  {
                    name: "bypass_diode_status",
                    type: "TEXT",
                    description: "Bypass diode status",
                    possible_values: [
                      "Failed",
                      "Normal",
                      "Partial"
                    ]
                  },
                  {
                    name: "junction_box_condition",
                    type: "TEXT",
                    description: "Junction box condition",
                    possible_values: [
                      "Fair",
                      "Good",
                      "Poor"
                    ]
                  },
                  {
                    name: "cable_condition",
                    type: "TEXT",
                    description: "Cable condition. May be null.",
                    possible_values: [
                      "Fair",
                      "Good",
                      "Poor"
                    ]
                  },
                  {
                    name: "connector_condition",
                    type: "TEXT",
                    description: "Connector condition",
                    possible_values: [
                      "Fair",
                      "Good",
                      "Poor"
                    ]
                  },
                  {
                    name: "grounding_status",
                    type: "TEXT",
                    description: "Grounding system status",
                    possible_values: [
                      "Check Required",
                      "Failed",
                      "Normal"
                    ]
                  }
                ]
              },
              mount_cleaning: {
                description: "Mounting structure and cleaning history",
                fields: [
                  {
                    name: "mount_structure_status",
                    type: "TEXT",
                    description: "Mounting structure condition",
                    possible_values: [
                      "Check Required",
                      "Stable",
                      "Unstable"
                    ]
                  },
                  {
                    name: "cleaning_cycle_days",
                    type: "BIGINT",
                    description: "Planned cleaning interval in days",
                    example: 38
                  },
                  {
                    name: "last_clean_date",
                    type: "DATE (as text)",
                    description: "Date of last cleaning, ISO format",
                    example: "2025-01-14"
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            snapmk: "PV937101",
            mech_health_snapshot: {
              tracker: {
                tracker_state: "Maintenance",
                tracker_angle_deg: 20.5
              },
              module_surface: {
                lid_status: "Unknown",
                pid_severity: null,
                hotspot_count: 1,
                glass_condition: "Clear",
                busbar_corrosion: "Severe",
                microcrack_count: 7,
                backsheet_condition: "Poor",
                delamination_status: "Minor",
                snail_trail_severity: "Light",
                encapsulant_yellowing: "Severe"
              },
              mount_cleaning: {
                last_clean_date: "2025-01-14",
                cleaning_cycle_days: 38,
                mount_structure_status: "Stable"
              },
              electrical_integrity: {
                cable_condition: "Good",
                grounding_status: "Normal",
                bypass_diode_status: "Partial",
                connector_condition: "Fair",
                junction_box_condition: "Good"
              }
            }
          },
          {
            snapmk: "PV945724",
            mech_health_snapshot: {
              tracker: {
                tracker_state: "Error",
                tracker_angle_deg: -37.5
              },
              module_surface: {
                lid_status: "Stabilized",
                pid_severity: "Low",
                hotspot_count: 3,
                glass_condition: "Damaged",
                busbar_corrosion: "Severe",
                microcrack_count: 3,
                backsheet_condition: "Fair",
                delamination_status: "Major",
                snail_trail_severity: "Light",
                encapsulant_yellowing: null
              },
              mount_cleaning: {
                last_clean_date: "2025-01-23",
                cleaning_cycle_days: 52,
                mount_structure_status: "Unstable"
              },
              electrical_integrity: {
                cable_condition: "Fair",
                grounding_status: "Failed",
                bypass_diode_status: "Normal",
                connector_condition: "Poor",
                junction_box_condition: "Fair"
              }
            }
          },
          {
            snapmk: "PV227567",
            mech_health_snapshot: {
              tracker: {
                tracker_state: "Normal",
                tracker_angle_deg: 21.3
              },
              module_surface: {
                lid_status: "Stabilized",
                pid_severity: "Low",
                hotspot_count: null,
                glass_condition: "Damaged",
                busbar_corrosion: "Visible",
                microcrack_count: 5,
                backsheet_condition: "Good",
                delamination_status: "Major",
                snail_trail_severity: "Light",
                encapsulant_yellowing: null
              },
              mount_cleaning: {
                last_clean_date: "2025-02-05",
                cleaning_cycle_days: 17,
                mount_structure_status: "Check Required"
              },
              electrical_integrity: {
                cable_condition: null,
                grounding_status: "Check Required",
                bypass_diode_status: "Partial",
                connector_condition: "Fair",
                junction_box_condition: "Good"
              }
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "snapmk",
            references: {
              table: "plant_record",
              column: "snapkey"
            }
          }
        ]
      },
      {
        name: "operational_metrics",
        role: "snapshot detail",
        description: "Reliability and cost figures per snapshot: failure and repair times, maintenance / cleaning / replacement costs, revenue loss and optimisation potential.",
        primary_key: [
          "snapops"
        ],
        columns: [
          {
            name: "snapops",
            type: "text",
            description: "Snapshot (1:1 with plant_record)",
            nullable: false,
            is_primary_key: true,
            foreign_key: {
              table: "plant_record",
              column: "snapkey"
            },
            example: "PV937101"
          },
          {
            name: "mtbfh",
            type: "real",
            description: "Mean time between failures (hours). Null = not reported.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 3713
          },
          {
            name: "mttrh",
            type: "real",
            description: "Mean time to repair (hours)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 8.8
          },
          {
            name: "maintcost",
            type: "real",
            description: "Maintenance cost",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 178.82
          },
          {
            name: "cleancost",
            type: "real",
            description: "Cleaning cost",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 1034.89
          },
          {
            name: "replcost",
            type: "real",
            description: "Component replacement cost",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 31529.13
          },
          {
            name: "revloss",
            type: "text",
            description: "Revenue loss, stored as formatted text with $ and thousands separators",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "$13,375.59",
            note: "Must be cleaned (strip '$' and ',') and cast to numeric before arithmetic."
          },
          {
            name: "optpot",
            type: "text",
            description: "Optimisation potential assessment",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "High",
              "Low",
              "Medium"
            ]
          }
        ],
        sample_rows: [
          {
            snapops: "PV937101",
            mtbfh: null,
            mttrh: 8.8,
            maintcost: 178.82,
            cleancost: 1034.89,
            replcost: 31529.1,
            revloss: "$13,375.59",
            optpot: "Medium"
          },
          {
            snapops: "PV945724",
            mtbfh: 3172.1,
            mttrh: 31.5,
            maintcost: 9549.83,
            cleancost: 2957.08,
            replcost: 15984.1,
            revloss: "$17,065.19",
            optpot: "High"
          },
          {
            snapops: "PV227567",
            mtbfh: 9686.8,
            mttrh: 21.7,
            maintcost: 9298.61,
            cleancost: 1934.67,
            replcost: 3604.59,
            revloss: "$14,035.91",
            optpot: "Low"
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "snapops",
            references: {
              table: "plant_record",
              column: "snapkey"
            }
          }
        ]
      },
      {
        name: "alert",
        role: "snapshot detail",
        description: "Active alert state and maintenance / replacement priorities for a snapshot.",
        primary_key: [
          "snapalrt"
        ],
        columns: [
          {
            name: "snapalrt",
            type: "text",
            description: "Snapshot (1:1 with plant_record)",
            nullable: false,
            is_primary_key: true,
            foreign_key: {
              table: "plant_record",
              column: "snapkey"
            },
            example: "PV937101"
          },
          {
            name: "alrtstate",
            type: "text",
            description: "Alert severity. Null = not reported.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Critical",
              "Warning"
            ]
          },
          {
            name: "alrtcnt",
            type: "text",
            description: "Number of active alerts, stored as text",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "6 events",
            note: "Text such as '6 events'; parse the number before aggregating."
          },
          {
            name: "maintprio",
            type: "text",
            description: "Maintenance priority. Null = not reported.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "High",
              "Low",
              "Medium"
            ]
          },
          {
            name: "replprio",
            type: "text",
            description: "Replacement priority",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "High",
              "Low",
              "Medium"
            ]
          }
        ],
        sample_rows: [
          {
            snapalrt: "PV937101",
            alrtstate: null,
            alrtcnt: "6 events",
            maintprio: "High",
            replprio: "High"
          },
          {
            snapalrt: "PV945724",
            alrtstate: "Warning",
            alrtcnt: "2 events",
            maintprio: "High",
            replprio: "High"
          },
          {
            snapalrt: "PV227567",
            alrtstate: null,
            alrtcnt: "9 events",
            maintprio: null,
            replprio: "High"
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "snapalrt",
            references: {
              table: "plant_record",
              column: "snapkey"
            }
          }
        ]
      },
      {
        name: "inspection",
        role: "standalone reference",
        description: "Inspection outcomes by inspection method, with maintenance schedule status and a data-quality score. Has no foreign keys: it is not linked to plants or snapshots.",
        primary_key: [
          "inspectmode"
        ],
        columns: [
          {
            name: "inspectmode",
            type: "text",
            description: "Inspection method",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            possible_values: [
              "EL Imaging",
              "IR Thermal",
              "IV Curve",
              "Visual"
            ]
          },
          {
            name: "inspectres",
            type: "text",
            description: "Inspection result summary",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Major Issues",
              "Minor Issues",
              "Pass"
            ]
          },
          {
            name: "inspectdt",
            type: "date",
            description: "Date of inspection",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "2024-08-24"
          },
          {
            name: "maintsched",
            type: "text",
            description: "Maintenance schedule status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Delayed",
              "On Schedule",
              "Overdue"
            ]
          },
          {
            name: "dqscore",
            type: "real",
            description: "Data quality score, 0 to 100",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 97.7
          }
        ],
        sample_rows: [
          {
            inspectmode: "Visual",
            inspectres: "Minor Issues",
            inspectdt: "2024-08-24",
            maintsched: "Delayed",
            dqscore: 97.7
          },
          {
            inspectmode: "IR Thermal",
            inspectres: "Major Issues",
            inspectdt: "2024-12-23",
            maintsched: "Overdue",
            dqscore: 19.9
          },
          {
            inspectmode: "IV Curve",
            inspectres: "Pass",
            inspectdt: "2025-02-13",
            maintsched: "Delayed",
            dqscore: 71.1
          }
        ],
        row_count: null,
        foreign_keys: []
      }
    ],
    relationships: [
      {
        from: "plants.modhook",
        to: "panel_models.modkey",
        type: "many-to-one",
        meaning: "Each plant uses one panel model"
      },
      {
        from: "plant_panel_model.sitelink",
        to: "plants.sitekey",
        type: "many-to-one",
        meaning: "Junction: plant side"
      },
      {
        from: "plant_panel_model.modlink",
        to: "panel_models.modkey",
        type: "many-to-one",
        meaning: "Junction: model side"
      },
      {
        from: "plant_record.sitetie",
        to: "plants.sitekey",
        type: "many-to-one",
        meaning: "A plant has many snapshots over time"
      },
      {
        from: "electrical_performance.snaplink",
        to: "plant_record.snapkey",
        type: "one-to-one",
        meaning: "Electrical detail of a snapshot"
      },
      {
        from: "environmental_conditions.snapref",
        to: "plant_record.snapkey",
        type: "one-to-one",
        meaning: "Weather detail of a snapshot"
      },
      {
        from: "mechanical_condition.snapmk",
        to: "plant_record.snapkey",
        type: "one-to-one",
        meaning: "Mechanical detail of a snapshot"
      },
      {
        from: "operational_metrics.snapops",
        to: "plant_record.snapkey",
        type: "one-to-one",
        meaning: "Cost and reliability detail of a snapshot"
      },
      {
        from: "alert.snapalrt",
        to: "plant_record.snapkey",
        type: "one-to-one",
        meaning: "Alert detail of a snapshot"
      }
    ],
    knowledge_base: [
      {
        id: 0,
        name: "Specific Yield",
        kind: "metric",
        description: "Energy output of a plant relative to its rated power capacity over a period.",
        formula: "energy_out_kWh / rated_power_kW",
        depends_on: []
      },
      {
        id: 1,
        name: "Power Capacity Factor",
        kind: "metric",
        description: "Actual energy output as a share of the maximum possible output over the same period.",
        formula: "energy_out / (rated_power × hours_in_period) × 100%",
        depends_on: []
      },
      {
        id: 2,
        name: "Soiling Loss Index",
        kind: "metric",
        description: "Percentage of power lost to dirt, dust and particulates on panel surfaces.",
        formula: "soil_loss_pct (a value of 10 means output is 10% below clean-panel output)",
        depends_on: []
      },
      {
        id: 3,
        name: "Thermal Loss Factor",
        kind: "metric",
        description: "Efficiency loss from cell temperature exceeding the 25°C reference.",
        formula: "(cell_temp_c − 25) × ABS(temperature_coefficient)",
        depends_on: []
      },
      {
        id: 4,
        name: "System Unavailability",
        kind: "metric",
        description: "Proportion of time a system is non-operational.",
        formula: "MTTR / (MTBF + MTTR)",
        depends_on: []
      },
      {
        id: 5,
        name: "Fill Factor Degradation",
        kind: "metric",
        description: "Drop in IV-curve fill factor from its initial value; higher means worse cell quality.",
        formula: "fill_factor_initial − fill_factor_now",
        depends_on: []
      },
      {
        id: 6,
        name: "Operational Expenditure Index",
        kind: "metric",
        description: "Total operating cost normalised by plant capacity.",
        formula: "(maintcost + cleancost + replcost) / capacity",
        depends_on: []
      },
      {
        id: 7,
        name: "Annual Degradation Rate (ADR)",
        kind: "metric",
        description: "Average yearly percentage performance loss since commissioning.",
        formula: "cumulative_deg_pct / plant_age_in_years",
        depends_on: []
      },
      {
        id: 8,
        name: "System Availability",
        kind: "metric",
        description: "Proportion of time a system is operational.",
        formula: "1 − System Unavailability",
        depends_on: [
          {
            id: 4,
            name: "System Unavailability"
          }
        ]
      },
      {
        id: 9,
        name: "Performance Ratio (PR)",
        kind: "metric",
        description: "Overall plant quality factor: actual output versus what irradiance theoretically allows.",
        formula: "Specific Yield / (POA irradiance in kWh/m² / 1 kW/m²)",
        depends_on: [
          {
            id: 0,
            name: "Specific Yield"
          }
        ]
      },
      {
        id: 10,
        name: "Temperature-Corrected Performance",
        kind: "metric",
        description: "Estimated power output if thermal losses were eliminated.",
        formula: "power_now_w / (1 − Thermal Loss Factor)",
        depends_on: [
          {
            id: 3,
            name: "Thermal Loss Factor"
          }
        ]
      },
      {
        id: 11,
        name: "Lifetime Revenue Loss Projection",
        kind: "metric",
        description: "Estimated lifetime revenue lost to ongoing annual degradation (simplified model).",
        formula: "ADR × annual_energy_production × energy_price × remaining_lifetime",
        depends_on: [
          {
            id: 7,
            name: "Annual Degradation Rate (ADR)"
          }
        ]
      },
      {
        id: 12,
        name: "Inverter Efficiency Loss",
        kind: "metric",
        description: "Share of DC power lost as heat during DC to AC conversion.",
        formula: "100 − inverter_eff_pct",
        depends_on: []
      },
      {
        id: 13,
        name: "System Power Loss Ratio",
        kind: "metric",
        description: "Share of generated power lost inside the system before reaching the grid.",
        formula: "power_loss / (power_output + power_loss)",
        depends_on: []
      },
      {
        id: 14,
        name: "Voltage Degradation Factor",
        kind: "metric",
        description: "Fractional decline of maximum-power-point voltage (Vmp) over time.",
        formula: "(vmp_initial_v − vmp_now_v) / vmp_initial_v",
        depends_on: []
      },
      {
        id: 15,
        name: "Current Degradation Factor",
        kind: "metric",
        description: "Fractional decline of maximum-power-point current (Imp) over time.",
        formula: "(imp_initial_a − imp_now_a) / imp_initial_a",
        depends_on: []
      },
      {
        id: 16,
        name: "Effective Power Output",
        kind: "metric",
        description: "Net usable power after internal losses.",
        formula: "gross_power × (1 − System Power Loss Ratio)",
        depends_on: [
          {
            id: 13,
            name: "System Power Loss Ratio"
          }
        ]
      },
      {
        id: 17,
        name: "Degradation-Adjusted Capacity",
        kind: "metric",
        description: "Current effective capacity after cumulative ageing.",
        formula: "rated_power × (1 − ADR × age)",
        depends_on: [
          {
            id: 7,
            name: "Annual Degradation Rate (ADR)"
          }
        ]
      },
      {
        id: 18,
        name: "Maintenance Cost to Revenue Impact Ratio",
        kind: "metric",
        description: "Maintenance spend compared with revenue lost to downtime. Below 1 means repairs cost less than the revenue they protect.",
        formula: "total_maintenance_cost / total_revenue_loss",
        depends_on: []
      },
      {
        id: 19,
        name: "Mean Repair Cost",
        kind: "metric",
        description: "Average cost of a single repair event; failure count is inferred from operating time and MTBF.",
        formula: "maintcost / (total_time / MTBF)",
        depends_on: []
      },
      {
        id: 20,
        name: "High Degradation Panel Model",
        kind: "business_rule",
        description: "Panel model that degrades faster than the industry norm.",
        rule: "degyrrate > 0.7 (example threshold)",
        depends_on: []
      },
      {
        id: 21,
        name: "Tracker Malfunction",
        kind: "business_rule",
        description: "Solar tracker not working properly.",
        rule: "tracker_state IN ('Error','Maintenance')",
        depends_on: []
      },
      {
        id: 22,
        name: "Data Quality Concern",
        kind: "business_rule",
        description: "Record whose quality score falls below an acceptable level.",
        rule: "dqscore < 50",
        depends_on: []
      },
      {
        id: 23,
        name: "Structural Integrity Warning",
        kind: "business_rule",
        description: "Mounting or support structure may be compromised.",
        rule: "mount_structure_status IN ('Unstable','Check Required')",
        depends_on: []
      },
      {
        id: 24,
        name: "High Maintenance Priority",
        kind: "business_rule",
        description: "Asset needs urgent maintenance.",
        rule: "maintprio = 'High'",
        depends_on: []
      },
      {
        id: 25,
        name: "High Replacement Priority",
        kind: "business_rule",
        description: "Asset or component is recommended for urgent replacement.",
        rule: "replprio = 'High'",
        depends_on: []
      },
      {
        id: 26,
        name: "Severe Soiling Condition",
        kind: "business_rule",
        description: "Panels are heavily soiled and losing significant energy.",
        rule: "Soiling Loss Index > 15 (%)",
        depends_on: [
          {
            id: 2,
            name: "Soiling Loss Index"
          }
        ]
      },
      {
        id: 27,
        name: "High Environmental Risk Site",
        kind: "business_rule",
        description: "Plant sited in an area with significant environmental challenges.",
        rule: "envtag = 'High'",
        depends_on: []
      },
      {
        id: 28,
        name: "Warranty Claim Risk",
        kind: "business_rule",
        description: "Plant likely to generate more warranty claims, based on history.",
        rule: "warrstate = 'Claimed' AND warrclaims > 2",
        depends_on: []
      },
      {
        id: 29,
        name: "Critical Alert",
        kind: "business_rule",
        description: "Severe issue needing immediate maintenance and likely replacement.",
        rule: "High Maintenance Priority AND High Replacement Priority",
        depends_on: [
          {
            id: 24,
            name: "High Maintenance Priority"
          },
          {
            id: 25,
            name: "High Replacement Priority"
          }
        ]
      },
      {
        id: 30,
        name: "Electrical Integrity Failure",
        kind: "business_rule",
        description: "Failure of fundamental electrical safety or operating components.",
        rule: "grounding_status = 'Failed' OR bypass_diode_status != 'Normal'",
        depends_on: []
      },
      {
        id: 31,
        name: "Major Module Degradation",
        kind: "business_rule",
        description: "Composite sign of severe physical ageing and damage to modules.",
        rule: "busbar_corrosion = 'Severe' AND delamination_status = 'Major' AND microcrack_count > 5",
        depends_on: []
      },
      {
        id: 32,
        name: "Underperforming Asset",
        kind: "business_rule",
        description: "Asset converting energy far below its benchmark.",
        rule: "Performance Ratio < 0.75",
        depends_on: [
          {
            id: 9,
            name: "Performance Ratio (PR)"
          }
        ]
      },
      {
        id: 33,
        name: "Chronic Downtime Asset",
        kind: "business_rule",
        description: "Asset with frequent failures and low uptime.",
        rule: "System Availability < 0.95",
        depends_on: [
          {
            id: 8,
            name: "System Availability"
          }
        ]
      },
      {
        id: 34,
        name: "High-Cost Asset",
        kind: "business_rule",
        description: "Asset whose operating cost is disproportionate to its capacity.",
        rule: "Operational Expenditure Index above a set threshold (10 used in examples)",
        depends_on: [
          {
            id: 6,
            name: "Operational Expenditure Index"
          }
        ]
      },
      {
        id: 35,
        name: "Critical Mechanical Health",
        kind: "business_rule",
        description: "Severe, simultaneous mechanical failures.",
        rule: "Structural Integrity Warning AND Tracker Malfunction",
        depends_on: [
          {
            id: 23,
            name: "Structural Integrity Warning"
          },
          {
            id: 21,
            name: "Tracker Malfunction"
          }
        ]
      },
      {
        id: 36,
        name: "Accelerated Aging Asset",
        kind: "business_rule",
        description: "Asset showing rapid performance decline and physical deterioration.",
        rule: "high ADR (0.5% used in examples) AND Major Module Degradation",
        depends_on: [
          {
            id: 7,
            name: "Annual Degradation Rate (ADR)"
          },
          {
            id: 31,
            name: "Major Module Degradation"
          }
        ]
      },
      {
        id: 37,
        name: "Overdue Critical Maintenance",
        kind: "business_rule",
        description: "Serious maintenance task not completed on schedule.",
        rule: "inspectres = 'Major Issues' AND maintsched = 'Overdue'",
        depends_on: []
      },
      {
        id: 38,
        name: "Neglected Asset",
        kind: "business_rule",
        description: "Asset in a critical state that is not getting attention.",
        rule: "Critical Alert AND Overdue Critical Maintenance AND Data Quality Concern",
        depends_on: [
          {
            id: 29,
            name: "Critical Alert"
          },
          {
            id: 37,
            name: "Overdue Critical Maintenance"
          },
          {
            id: 22,
            name: "Data Quality Concern"
          }
        ]
      },
      {
        id: 39,
        name: "Decommissioning Candidate",
        kind: "business_rule",
        description: "Plant that may be a candidate for retirement.",
        rule: "Neglected Asset AND High-Cost Asset",
        depends_on: [
          {
            id: 38,
            name: "Neglected Asset"
          },
          {
            id: 34,
            name: "High-Cost Asset"
          }
        ]
      },
      {
        id: 40,
        name: "Power Factor",
        kind: "reference",
        description: "Ratio of real to apparent power, from -1 to 1. 1.0 is perfect; about 0.95 is typical for high-efficiency systems.",
        depends_on: []
      },
      {
        id: 41,
        name: "Temperature Coefficient of Power",
        kind: "reference",
        description: "Power loss per °C above the 25°C reference. A typical value is -0.39 %/°C.",
        depends_on: []
      },
      {
        id: 42,
        name: "IV Curve Fill Factor",
        kind: "reference",
        description: "'Squareness' of the IV curve; ratio of actual max power to theoretical max. Above 0.8 indicates a high-quality cell.",
        depends_on: []
      },
      {
        id: 43,
        name: "UV Index",
        kind: "reference",
        description: "Open-ended UV strength scale: 1-2 Low, 3-5 Moderate, 6-7 High, 8-10 Very High, 11+ Extreme.",
        depends_on: []
      },
      {
        id: 44,
        name: "Tracker System State",
        kind: "reference",
        description: "Tracker states: Normal (tracking), Maintenance (being serviced), Error (malfunctioning), Stow (locked in safe position, e.g. high wind).",
        depends_on: []
      },
      {
        id: 45,
        name: "Data Quality Score (DQS)",
        kind: "reference",
        description: "0 to 100 completeness/consistency score. 95-100 is high quality; below 50 is likely unreliable.",
        depends_on: []
      },
      {
        id: 46,
        name: "Busbar Corrosion Severity",
        kind: "reference",
        description: "Levels from None, Light (minor discoloration), Visible (clear but limited), to Severe (widespread, hurts conductivity).",
        depends_on: []
      },
      {
        id: 47,
        name: "Mean Time Between Failures (MTBF)",
        kind: "reference",
        description: "Average operating hours before a failure. Above 8000 h is very reliable; below 1000 h fails often.",
        depends_on: []
      },
      {
        id: 48,
        name: "Nominal Operating Cell Temperature (NOCT)",
        kind: "reference",
        description: "Cell temperature under 800 W/m², 20°C ambient and 1 m/s wind. Typically about 45°C.",
        depends_on: []
      },
      {
        id: 49,
        name: "Total Harmonic Distortion (THD)",
        kind: "reference",
        description: "Harmonic distortion relative to the fundamental. Below 5% is desirable for good power quality.",
        depends_on: []
      }
    ],
    data_quirks: [
      "revloss is TEXT like '$13,375.59'; strip '$' and ',' then cast to numeric.",
      "alrtcnt is TEXT like '6 events'; extract the number before aggregating.",
      "series_res_ohm (inside elec_perf_snapshot) is TEXT like '0.17 Ω'; spectral_mismatch is TEXT like '100.50%'.",
      "nomoptempc is TEXT with a unit, e.g. '45.7 °C'.",
      "JSONB fields are accessed with ->/->> and need a cast, e.g. (env_snapshot->'temperatures'->>'cell_temp_c')::real.",
      "Many fields are NULL (missing sensor data), and some REAL values appear as NaN, so treat missing values explicitly.",
      "Each plant has many snapshots in plant_record; 'latest' or 'current' means the row with the max snapts per plant.",
      "inspection has no foreign keys and cannot be joined to plants or snapshots.",
      "performance_ratio in elec_perf_snapshot is frequently null; Performance Ratio may need to be derived (see knowledge base)."
    ],
    sample_questions: [
      {
        question: "What is the system unavailability of Solar Plant West Davidport?",
        type: "KPI lookup",
        uses_knowledge: [
          "System Unavailability"
        ]
      },
      {
        question: "Which plants are a warranty claim risk?",
        type: "Filtered list",
        uses_knowledge: [
          "Warranty Claim Risk"
        ]
      },
      {
        question: "What is the temperature-corrected performance of snapshot PV945724?",
        type: "KPI lookup",
        uses_knowledge: [
          "Temperature-Corrected Performance",
          "Thermal Loss Factor"
        ]
      },
      {
        question: "How many plants are both underperforming and suffering chronic downtime?",
        type: "Count",
        uses_knowledge: [
          "Underperforming Asset",
          "Chronic Downtime Asset"
        ]
      },
      {
        question: "Which plant has the highest operational expenditure index?",
        type: "Ranking",
        uses_knowledge: [
          "Operational Expenditure Index"
        ]
      },
      {
        question: "How much do panels with severe busbar corrosion lose in fill factor on average?",
        type: "Aggregation",
        uses_knowledge: [
          "Fill Factor Degradation"
        ]
      },
      {
        question: "What is the average repair cost for plants that use HJT panels?",
        type: "Aggregation",
        uses_knowledge: [
          "Mean Repair Cost"
        ]
      },
      {
        question: "How much revenue do we lose when electrical grounding fails?",
        type: "Aggregation",
        uses_knowledge: [
          "Electrical Integrity Failure"
        ]
      },
      {
        question: "How many snapshots show severe soiling?",
        type: "Count",
        uses_knowledge: [
          "Severe Soiling Condition",
          "Soiling Loss Index"
        ]
      },
      {
        question: "What is the average voltage degradation by panel technology?",
        type: "Group-by",
        uses_knowledge: [
          "Voltage Degradation Factor"
        ]
      },
      {
        question: "What is the projected lifetime revenue loss for plants using high-degradation panel models?",
        type: "Projection",
        uses_knowledge: [
          "Lifetime Revenue Loss Projection",
          "High Degradation Panel Model"
        ]
      },
      {
        question: "What is the average current degradation for panels made by Longi?",
        type: "Aggregation",
        uses_knowledge: [
          "Current Degradation Factor"
        ]
      },
      {
        question: "Which plants are decommissioning candidates?",
        type: "Composite rule",
        uses_knowledge: [
          "Decommissioning Candidate",
          "Neglected Asset",
          "High-Cost Asset"
        ]
      }
    ]
  },
  {
    id: "polar_equipment",
    name: "Polar Station Equipment",
    domain: "Polar research infrastructure / remote equipment operations",
    description: "Operations data for equipment deployed at Arctic and Antarctic stations. Each unit is tracked across engine, transmission, chassis, power, communications, cabin, safety, water, scientific, weather and renewable-energy readings, together with maintenance schedules and costs.",
    engine: "PostgreSQL",
    source: {
      benchmark: "BIRD-Interact (full)",
      dataset_url: "https://huggingface.co/datasets/birdsql/bird-interact-full",
      folder: "polar_equipment",
      paper: "https://arxiv.org/abs/2510.05318",
      license: "CC BY-SA 4.0",
      attribution: "BIRD Team & Google Cloud"
    },
    what_you_can_ask: [
      "Equipment reliability, utilisation and age",
      "Maintenance schedule, cost and compliance",
      "Battery, engine and powertrain health",
      "Safety systems, life support and cabin conditions",
      "Weather and structural risk at stations",
      "Solar, wind, fuel-cell and grid performance",
      "Connectivity and communications quality"
    ],
    stats: {
      table_count: 16,
      jsonb_column_count: 5,
      row_counts_note: "Row counts are null because the dump is not hosted on Hugging Face; fill after loading it."
    },
    tables: [
      {
        name: "Equipment",
        role: "core entity",
        description: "One row per piece of polar-station equipment: type, model, manufacturer, years in service, utilisation and reliability. Most other tables attach to it through equipRef.",
        primary_key: [
          "EQUIP_CODE"
        ],
        columns: [
          {
            name: "EQUIP_CODE",
            type: "text",
            description: "Unique equipment identifier",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: "PE593707"
          },
          {
            name: "EquipType",
            type: "text",
            description: "Equipment type",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "EquipmentType",
              column: "EquipType"
            },
            example: "Shelter"
          },
          {
            name: "model_name",
            type: "text",
            description: "Model name. Null = not provided.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Model-925"
          },
          {
            name: "MakerName",
            type: "text",
            description: "Manufacturer name. Null = not provided.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Wiggins Inc"
          },
          {
            name: "SERVICE_YRS",
            type: "bigint",
            description: "Number of years in service",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 4
          },
          {
            name: "utilPercent",
            type: "real",
            description: "Utilisation percentage",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 53
          },
          {
            name: "RELIAB_IDX",
            type: "real",
            description: "Reliability index",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 97.8
          }
        ],
        sample_rows: [
          {
            EQUIP_CODE: "PE593707",
            EquipType: "Shelter",
            model_name: "Model-925",
            MakerName: "Lee, Meyers and Hamilton",
            SERVICE_YRS: 4,
            utilPercent: 53,
            RELIAB_IDX: 97.8
          },
          {
            EQUIP_CODE: "PE292528",
            EquipType: "Scientific",
            model_name: "Model-454",
            MakerName: "Wiggins Inc",
            SERVICE_YRS: 6,
            utilPercent: 60,
            RELIAB_IDX: 97.7
          },
          {
            EQUIP_CODE: "PE617633",
            EquipType: "Safety",
            model_name: null,
            MakerName: "Graves-Cox",
            SERVICE_YRS: 10,
            utilPercent: 81,
            RELIAB_IDX: 97
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "EquipType",
            references: {
              table: "EquipmentType",
              column: "EquipType"
            }
          }
        ]
      },
      {
        name: "EquipmentType",
        role: "reference / lookup",
        description: "Equipment families (shelter, scientific, safety, ...) with performance, efficiency, safety and environmental-impact indices stored as JSONB.",
        primary_key: [
          "EquipType"
        ],
        columns: [
          {
            name: "EquipType",
            type: "text",
            description: "Unique identifier of the equipment type",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            possible_values: [
              "Communication",
              "Generator",
              "Safety",
              "Scientific",
              "Shelter",
              "Vehicle"
            ]
          },
          {
            name: "type_indices",
            type: "jsonb",
            description: "Index scores for the equipment family (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              root: {
                description: "Family-level indices",
                fields: [
                  {
                    name: "performance_score",
                    type: "REAL",
                    description: "Performance index for the equipment type",
                    example: 72.8
                  },
                  {
                    name: "energy_efficiency_idx",
                    type: "REAL",
                    description: "Efficiency index for the equipment type",
                    example: 47.1
                  },
                  {
                    name: "safety_idx",
                    type: "REAL",
                    description: "Safety index for the equipment type",
                    example: 75.9
                  },
                  {
                    name: "environmental_impact_idx",
                    type: "REAL",
                    description: "Environmental impact index for the equipment type",
                    example: 36.7
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            EquipType: "Shelter",
            type_indices: {
              safety_idx: 75.9,
              performance_score: 72.8,
              energy_efficiency_idx: 47.1,
              environmental_impact_idx: 36.7
            }
          },
          {
            EquipType: "Scientific",
            type_indices: {
              safety_idx: 35.9,
              performance_score: 48.8,
              energy_efficiency_idx: 72.2,
              environmental_impact_idx: 74.7
            }
          },
          {
            EquipType: "Safety",
            type_indices: {
              safety_idx: 34.6,
              performance_score: 93,
              energy_efficiency_idx: 36.8,
              environmental_impact_idx: 87.3
            }
          }
        ],
        row_count: null,
        foreign_keys: []
      },
      {
        name: "Location",
        role: "reference / lookup",
        description: "Polar stations (Arctic or Antarctic) with timestamp, coordinates and altitude.",
        primary_key: [
          "STATION_name"
        ],
        columns: [
          {
            name: "STATION_name",
            type: "text",
            description: "Unique station name",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: "Station-14"
          },
          {
            name: "TimeStamp",
            type: "timestamp without time zone",
            description: "When the location data was recorded",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "2024-10-29 17:30:55"
          },
          {
            name: "locType",
            type: "text",
            description: "Type of location",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Antarctic",
              "Arctic"
            ]
          },
          {
            name: "LAT_deg",
            type: "real",
            description: "Latitude in degrees",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 80.255202
          },
          {
            name: "LON_deg",
            type: "real",
            description: "Longitude in degrees",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: -146.257874
          },
          {
            name: "altitude_m",
            type: "real",
            description: "Altitude in metres. Null = not provided.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 2054.5
          }
        ],
        sample_rows: [
          {
            STATION_name: "Station-14",
            TimeStamp: "2024-10-29 17:30:55",
            locType: "Arctic",
            LAT_deg: 80.2552,
            LON_deg: -146.258,
            altitude_m: 2054.5
          },
          {
            STATION_name: "Station-8",
            TimeStamp: "2024-03-28 10:51:42",
            locType: "Antarctic",
            LAT_deg: -61.9982,
            LON_deg: -153.401,
            altitude_m: 1343.9
          },
          {
            STATION_name: "Station-19",
            TimeStamp: "2024-02-23 01:26:41",
            locType: "Arctic",
            LAT_deg: 76.0172,
            LON_deg: -10.7953,
            altitude_m: 479.1
          }
        ],
        row_count: null,
        foreign_keys: []
      },
      {
        name: "StationEquipmentType",
        role: "junction",
        description: "Link table stating which equipment types are present at which station.",
        primary_key: [
          "station_name",
          "equip_type"
        ],
        columns: [
          {
            name: "station_name",
            type: "text",
            description: "Station",
            nullable: false,
            is_primary_key: true,
            foreign_key: {
              table: "Location",
              column: "STATION_name"
            },
            example: "Station-14"
          },
          {
            name: "equip_type",
            type: "text",
            description: "Equipment type",
            nullable: false,
            is_primary_key: true,
            foreign_key: {
              table: "EquipmentType",
              column: "EquipType"
            },
            possible_values: [
              "Communication",
              "Generator",
              "Safety",
              "Scientific",
              "Shelter",
              "Vehicle"
            ]
          }
        ],
        sample_rows: [
          {
            station_name: "Station-14",
            equip_type: "Shelter"
          },
          {
            station_name: "Station-8",
            equip_type: "Scientific"
          },
          {
            station_name: "Station-19",
            equip_type: "Safety"
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "station_name",
            references: {
              table: "Location",
              column: "STATION_name"
            }
          },
          {
            column: "equip_type",
            references: {
              table: "EquipmentType",
              column: "EquipType"
            }
          }
        ]
      },
      {
        name: "OperationMaintenance",
        role: "snapshot detail",
        description: "Operating hours, maintenance schedule and cost, repair and operating cost, crew certification, inspection and compliance state per equipment record.",
        primary_key: [
          "OP_MAINT_ID"
        ],
        columns: [
          {
            name: "OP_MAINT_ID",
            type: "bigint",
            description: "Unique operation / maintenance record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "equipRef",
            type: "text",
            description: "Equipment",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "Equipment",
              column: "EQUIP_CODE"
            },
            example: "PE593707"
          },
          {
            name: "OPER_hours",
            type: "real",
            description: "Total operating hours",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 17843
          },
          {
            name: "maintCycleHrs",
            type: "real",
            description: "Maintenance cycle length in hours. Null = none defined.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 2047
          },
          {
            name: "LAST_maint_date",
            type: "date",
            description: "Date of last maintenance. Null = not provided.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "2024-02-25"
          },
          {
            name: "NEXT_due_date",
            type: "date",
            description: "Date next maintenance is due. Null = not provided.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "2025-11-16"
          },
          {
            name: "OPER_status",
            type: "text",
            description: "Operational status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Active",
              "Maintenance",
              "Repair",
              "Standby",
              "Storage"
            ]
          },
          {
            name: "MAINT_COST_usd",
            type: "real",
            description: "Maintenance cost in USD",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 7632.51
          },
          {
            name: "repairCostUsd",
            type: "real",
            description: "Repair cost in USD",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 3297.13
          },
          {
            name: "operating_cost_usd",
            type: "real",
            description: "Operating cost in USD. Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 338.79
          },
          {
            name: "crewCertStatus",
            type: "text",
            description: "Crew certification status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Expired",
              "Pending",
              "Valid"
            ]
          },
          {
            name: "inspect_status",
            type: "text",
            description: "Inspection status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Failed",
              "Passed",
              "Pending"
            ]
          },
          {
            name: "COMPLIANCE_state",
            type: "text",
            description: "Compliance state. Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Compliant",
              "Non-compliant",
              "Review"
            ]
          },
          {
            name: "docu_status",
            type: "text",
            description: "Documentation status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Complete",
              "Incomplete",
              "Updated"
            ]
          },
          {
            name: "comm_link",
            type: "bigint",
            description: "Optional reference to a communication record (no declared foreign key)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null
          }
        ],
        sample_rows: [
          {
            OP_MAINT_ID: 1,
            equipRef: "PE593707",
            OPER_hours: 17843,
            maintCycleHrs: 2047,
            LAST_maint_date: "2024-02-25",
            NEXT_due_date: "2025-11-16",
            OPER_status: "Storage",
            MAINT_COST_usd: 7632.51,
            repairCostUsd: 3297.13,
            operating_cost_usd: 338.79,
            crewCertStatus: "Valid",
            inspect_status: "Failed",
            COMPLIANCE_state: "Review",
            docu_status: "Updated",
            comm_link: null
          },
          {
            OP_MAINT_ID: 2,
            equipRef: "PE292528",
            OPER_hours: 45000,
            maintCycleHrs: 2269,
            LAST_maint_date: "2024-07-02",
            NEXT_due_date: "2025-04-08",
            OPER_status: "Standby",
            MAINT_COST_usd: 3608.69,
            repairCostUsd: 1688.51,
            operating_cost_usd: 483.45,
            crewCertStatus: "Pending",
            inspect_status: "Failed",
            COMPLIANCE_state: "Non-compliant",
            docu_status: "Incomplete",
            comm_link: null
          },
          {
            OP_MAINT_ID: 3,
            equipRef: "PE617633",
            OPER_hours: 49833,
            maintCycleHrs: 2335,
            LAST_maint_date: "2025-01-21",
            NEXT_due_date: "2025-11-21",
            OPER_status: "Standby",
            MAINT_COST_usd: 6231.56,
            repairCostUsd: 1855.45,
            operating_cost_usd: 911.76,
            crewCertStatus: "Valid",
            inspect_status: "Passed",
            COMPLIANCE_state: "Review",
            docu_status: "Incomplete",
            comm_link: null
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "equipRef",
            references: {
              table: "Equipment",
              column: "EQUIP_CODE"
            }
          }
        ]
      },
      {
        name: "PowerBattery",
        role: "snapshot detail",
        description: "Battery and power-state telemetry per equipment unit, stored as JSONB: power source, state of charge, health, cycle count and charging parameters.",
        primary_key: [
          "PWR_BATT_ID"
        ],
        columns: [
          {
            name: "PWR_BATT_ID",
            type: "bigint",
            description: "Unique battery record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "equip_ref",
            type: "text",
            description: "Equipment",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "Equipment",
              column: "EQUIP_CODE"
            },
            example: "PE593707"
          },
          {
            name: "battery_telemetry",
            type: "jsonb",
            description: "Nested battery and power state (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              power_state: {
                description: "Overall power state",
                fields: [
                  {
                    name: "system_state",
                    type: "TEXT",
                    description: "Power status of the battery",
                    possible_values: [
                      "Charging",
                      "Off",
                      "On",
                      "Sleep"
                    ]
                  },
                  {
                    name: "primary_source",
                    type: "TEXT",
                    description: "Primary power source",
                    possible_values: [
                      "Battery",
                      "Diesel",
                      "Hybrid",
                      "Solar",
                      "Wind"
                    ]
                  },
                  {
                    name: "instant_consumption_w",
                    type: "REAL",
                    description: "Power consumption in watts",
                    example: 4383.2
                  },
                  {
                    name: "conversion_eff_pct",
                    type: "REAL",
                    description: "Energy conversion efficiency (%)",
                    example: 81.8
                  }
                ]
              },
              battery_pack: {
                description: "Battery pack health",
                fields: [
                  {
                    name: "soc_pct",
                    type: "REAL",
                    description: "State of charge (%)",
                    example: 19
                  },
                  {
                    name: "health_pct",
                    type: "REAL",
                    description: "Battery health (%)",
                    example: 93
                  },
                  {
                    name: "cycle_count",
                    type: "BIGINT",
                    description: "Charge cycles completed",
                    example: 79
                  },
                  {
                    name: "temperature_c",
                    type: "REAL",
                    description: "Battery temperature (°C)",
                    example: -22.9
                  }
                ]
              },
              charging: {
                description: "Charging parameters",
                fields: [
                  {
                    name: "charge_state",
                    type: "TEXT",
                    description: "Charging status",
                    possible_values: [
                      "Charging",
                      "Error",
                      "Full",
                      "Not Charging"
                    ]
                  },
                  {
                    name: "current_a",
                    type: "REAL",
                    description: "Charging current (A). May be null.",
                    example: 24.12
                  },
                  {
                    name: "voltage_v",
                    type: "REAL",
                    description: "Charging voltage (V)",
                    example: 26.5
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            PWR_BATT_ID: 1,
            equip_ref: "PE593707",
            battery_telemetry: {
              charging: {
                current_a: null,
                voltage_v: 26.5,
                charge_state: "Error"
              },
              power_state: {
                system_state: "Sleep",
                primary_source: "Wind",
                conversion_eff_pct: 81.8,
                instant_consumption_w: 4383.2
              },
              battery_pack: {
                soc_pct: 19,
                health_pct: 93,
                cycle_count: 79,
                temperature_c: -22.9
              }
            }
          },
          {
            PWR_BATT_ID: 2,
            equip_ref: "PE292528",
            battery_telemetry: {
              charging: {
                current_a: 24.12,
                voltage_v: 19.8,
                charge_state: "Not Charging"
              },
              power_state: {
                system_state: "Charging",
                primary_source: "Solar",
                conversion_eff_pct: 74.4,
                instant_consumption_w: 2710.9
              },
              battery_pack: {
                soc_pct: 32,
                health_pct: 74,
                cycle_count: 617,
                temperature_c: 31.6
              }
            }
          },
          {
            PWR_BATT_ID: 3,
            equip_ref: "PE617633",
            battery_telemetry: {
              charging: {
                current_a: 15.94,
                voltage_v: 39.1,
                charge_state: "Charging"
              },
              power_state: {
                system_state: "On",
                primary_source: "Wind",
                conversion_eff_pct: 87.7,
                instant_consumption_w: 3552.2
              },
              battery_pack: {
                soc_pct: 42,
                health_pct: 67,
                cycle_count: 667,
                temperature_c: -12
              }
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "equip_ref",
            references: {
              table: "Equipment",
              column: "EQUIP_CODE"
            }
          }
        ]
      },
      {
        name: "EngineAndFluids",
        role: "snapshot detail",
        description: "Engine operating metrics and fluid levels, temperatures and pressures (fuel, oil, coolant, hydraulics) as a JSONB snapshot.",
        primary_key: [
          "ENGINE_ID"
        ],
        columns: [
          {
            name: "ENGINE_ID",
            type: "bigint",
            description: "Unique engine record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "equipRef",
            type: "text",
            description: "Equipment",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "Equipment",
              column: "EQUIP_CODE"
            },
            example: "PE593707"
          },
          {
            name: "batt_link",
            type: "bigint",
            description: "Related battery record",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "PowerBattery",
              column: "PWR_BATT_ID"
            }
          },
          {
            name: "opmaint_link",
            type: "bigint",
            description: "Related operation / maintenance record",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "OperationMaintenance",
              column: "OP_MAINT_ID"
            }
          },
          {
            name: "engine_fluids_snapshot",
            type: "jsonb",
            description: "Nested engine and fluid readings (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              fuel: {
                description: "Fuel system",
                fields: [
                  {
                    name: "level_pct",
                    type: "REAL",
                    description: "Fuel level (%)",
                    example: 49
                  },
                  {
                    name: "consumption_lph",
                    type: "REAL",
                    description: "Fuel consumption (L/h)",
                    example: 44.48
                  },
                  {
                    name: "rail_pressure_kpa",
                    type: "BIGINT",
                    description: "Fuel pressure (kPa). May be null.",
                    example: 89.9
                  },
                  {
                    name: "temperature_c",
                    type: "REAL",
                    description: "Fuel temperature (°C)",
                    example: -37.2
                  }
                ]
              },
              oil: {
                description: "Engine oil",
                fields: [
                  {
                    name: "level_pct",
                    type: "REAL",
                    description: "Oil level (%)",
                    example: 49
                  },
                  {
                    name: "pressure_kpa",
                    type: "BIGINT",
                    description: "Oil pressure (kPa)",
                    example: 331.4
                  },
                  {
                    name: "temperature_c",
                    type: "REAL",
                    description: "Oil temperature (°C)",
                    example: 6.6
                  }
                ]
              },
              coolant: {
                description: "Coolant",
                fields: [
                  {
                    name: "level_pct",
                    type: "REAL",
                    description: "Coolant level (%)",
                    example: 64
                  },
                  {
                    name: "temperature_c",
                    type: "REAL",
                    description: "Coolant temperature (°C)",
                    example: 69.3
                  },
                  {
                    name: "pressure_kpa_or_code",
                    type: "TEXT",
                    description: "Coolant pressure, stored as text with unit",
                    example: "88.9 hPa"
                  }
                ]
              },
              hydraulic: {
                description: "Hydraulics",
                fields: [
                  {
                    name: "pressure_kpa",
                    type: "REAL",
                    description: "Hydraulic pressure (kPa)",
                    example: 19647.2
                  },
                  {
                    name: "temperature_c",
                    type: "REAL",
                    description: "Hydraulic temperature (°C)",
                    example: 39.2
                  },
                  {
                    name: "fluid_level_pct",
                    type: "REAL",
                    description: "Hydraulic fluid level (%)",
                    example: 59
                  }
                ]
              },
              engine_core: {
                description: "Core engine metrics",
                fields: [
                  {
                    name: "rpm",
                    type: "BIGINT",
                    description: "Engine RPM. May be null.",
                    example: 3133
                  },
                  {
                    name: "load_pct",
                    type: "REAL",
                    description: "Engine load (%)",
                    example: 61
                  },
                  {
                    name: "block_temp_c",
                    type: "REAL",
                    description: "Engine block temperature (°C)",
                    example: 4.1
                  },
                  {
                    name: "lifetime_hours",
                    type: "REAL",
                    description: "Total engine hours",
                    example: 31452
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            ENGINE_ID: 1,
            equipRef: "PE593707",
            batt_link: 1,
            opmaint_link: null,
            engine_fluids_snapshot: {
              oil: {
                level_pct: 49,
                pressure_kpa: 331,
                temperature_c: 6.6
              },
              fuel: {
                level_pct: 49,
                temperature_c: -37.2,
                consumption_lph: 44.48,
                rail_pressure_kpa: null
              },
              coolant: {
                level_pct: 64,
                temperature_c: 69.3,
                pressure_kpa_or_code: "88.9 hPa"
              },
              hydraulic: {
                pressure_kpa: 19647.2,
                temperature_c: 39.2,
                fluid_level_pct: 59
              },
              engine_core: {
                rpm: 3133,
                load_pct: 61,
                block_temp_c: 4.1,
                lifetime_hours: 31452
              }
            }
          },
          {
            ENGINE_ID: 2,
            equipRef: "PE292528",
            batt_link: 2,
            opmaint_link: null,
            engine_fluids_snapshot: {
              oil: {
                level_pct: 21,
                pressure_kpa: 141,
                temperature_c: 26.1
              },
              fuel: {
                level_pct: 68,
                temperature_c: 19.8,
                consumption_lph: 14.85,
                rail_pressure_kpa: 90
              },
              coolant: {
                level_pct: 58,
                temperature_c: -6.7,
                pressure_kpa_or_code: "147.2 hPa"
              },
              hydraulic: {
                pressure_kpa: 9189.7,
                temperature_c: 31.5,
                fluid_level_pct: 10
              },
              engine_core: {
                rpm: 1669,
                load_pct: 34,
                block_temp_c: 66.3,
                lifetime_hours: 45593
              }
            }
          },
          {
            ENGINE_ID: 3,
            equipRef: "PE617633",
            batt_link: 3,
            opmaint_link: null,
            engine_fluids_snapshot: {
              oil: {
                level_pct: 71,
                pressure_kpa: 598,
                temperature_c: 49.2
              },
              fuel: {
                level_pct: 88,
                temperature_c: -1.7,
                consumption_lph: 30.24,
                rail_pressure_kpa: 421
              },
              coolant: {
                level_pct: 26,
                temperature_c: 59.5,
                pressure_kpa_or_code: "18.2 hPa"
              },
              hydraulic: {
                pressure_kpa: 18097.7,
                temperature_c: 38.4,
                fluid_level_pct: 92
              },
              engine_core: {
                rpm: 2447,
                load_pct: 40,
                block_temp_c: 28.2,
                lifetime_hours: 28148
              }
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "equipRef",
            references: {
              table: "Equipment",
              column: "EQUIP_CODE"
            }
          },
          {
            column: "batt_link",
            references: {
              table: "PowerBattery",
              column: "PWR_BATT_ID"
            }
          },
          {
            column: "opmaint_link",
            references: {
              table: "OperationMaintenance",
              column: "OP_MAINT_ID"
            }
          }
        ]
      },
      {
        name: "Transmission",
        role: "snapshot detail",
        description: "Transmission, differential and axle temperatures, transmission pressure and current gear per equipment unit.",
        primary_key: [
          "TRANS_ID"
        ],
        columns: [
          {
            name: "TRANS_ID",
            type: "bigint",
            description: "Unique transmission record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "equipRef",
            type: "text",
            description: "Equipment",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "Equipment",
              column: "EQUIP_CODE"
            },
            example: "PE593707"
          },
          {
            name: "engine_link",
            type: "bigint",
            description: "Related engine record",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "EngineAndFluids",
              column: "ENGINE_ID"
            }
          },
          {
            name: "transTempC",
            type: "real",
            description: "Transmission temperature (°C)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 94.5
          },
          {
            name: "transPress_kpa",
            type: "real",
            description: "Transmission pressure (kPa). Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 532.9
          },
          {
            name: "TRANS_gear",
            type: "text",
            description: "Current gear. Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              -1,
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ]
          },
          {
            name: "diffTempC",
            type: "real",
            description: "Differential temperature (°C)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 80.9
          },
          {
            name: "axleTempC",
            type: "real",
            description: "Axle temperature (°C)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 22.1
          },
          {
            name: "opmaint_link",
            type: "bigint",
            description: "Related operation / maintenance record",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "OperationMaintenance",
              column: "OP_MAINT_ID"
            }
          }
        ],
        sample_rows: [
          {
            TRANS_ID: 1,
            equipRef: "PE593707",
            engine_link: 1,
            transTempC: 94.5,
            transPress_kpa: 532.9,
            TRANS_gear: "3",
            diffTempC: 80.9,
            axleTempC: 22.1,
            opmaint_link: null
          },
          {
            TRANS_ID: 2,
            equipRef: "PE292528",
            engine_link: 2,
            transTempC: 30.6,
            transPress_kpa: 82.8,
            TRANS_gear: "-1",
            diffTempC: 54.6,
            axleTempC: 90.8,
            opmaint_link: null
          },
          {
            TRANS_ID: 3,
            equipRef: "PE617633",
            engine_link: 3,
            transTempC: 68,
            transPress_kpa: 1632.5,
            TRANS_gear: "1",
            diffTempC: -19.8,
            axleTempC: 43.1,
            opmaint_link: null
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "equipRef",
            references: {
              table: "Equipment",
              column: "EQUIP_CODE"
            }
          },
          {
            column: "engine_link",
            references: {
              table: "EngineAndFluids",
              column: "ENGINE_ID"
            }
          },
          {
            column: "opmaint_link",
            references: {
              table: "OperationMaintenance",
              column: "OP_MAINT_ID"
            }
          }
        ]
      },
      {
        name: "ChassisAndVehicle",
        role: "snapshot detail",
        description: "Running-gear and motion telemetry for ground vehicles (brakes, tyres, tracks, suspension, speed and payload) as JSONB.",
        primary_key: [
          "CHASSIS_ID"
        ],
        columns: [
          {
            name: "CHASSIS_ID",
            type: "bigint",
            description: "Unique chassis record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "equipRef",
            type: "text",
            description: "Equipment",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "Equipment",
              column: "EQUIP_CODE"
            },
            example: "PE593707"
          },
          {
            name: "trans_link",
            type: "bigint",
            description: "Related transmission record",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "Transmission",
              column: "TRANS_ID"
            }
          },
          {
            name: "engine_link",
            type: "bigint",
            description: "Related engine record",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "EngineAndFluids",
              column: "ENGINE_ID"
            }
          },
          {
            name: "ground_vehicle_status",
            type: "jsonb",
            description: "Nested vehicle status (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              brake_system: {
                description: "Brakes",
                fields: [
                  {
                    name: "pad_wear_pct",
                    type: "REAL",
                    description: "Brake pad wear (%). May be null.",
                    example: 69
                  },
                  {
                    name: "fluid_level_pct",
                    type: "REAL",
                    description: "Brake fluid level (%)",
                    example: 97
                  },
                  {
                    name: "pressure_kpa_or_code",
                    type: "TEXT",
                    description: "Brake pressure, stored as text with unit",
                    example: "370.8 hPa"
                  }
                ]
              },
              tires: {
                description: "Tyres",
                fields: [
                  {
                    name: "pressure_kpa",
                    type: "BIGINT",
                    description: "Tyre pressure (kPa)",
                    example: 345
                  },
                  {
                    name: "temperature_c",
                    type: "REAL",
                    description: "Tyre temperature (°C)",
                    example: 28.7
                  },
                  {
                    name: "tread_depth_mm",
                    type: "REAL",
                    description: "Tread depth (mm)",
                    example: 12.8
                  }
                ]
              },
              tracks: {
                description: "Tracks",
                fields: [
                  {
                    name: "tension_kN",
                    type: "REAL",
                    description: "Track tension (kN)",
                    example: 21.9
                  },
                  {
                    name: "wear_pct",
                    type: "REAL",
                    description: "Track wear (%). May be null.",
                    example: 35
                  }
                ]
              },
              suspension: {
                description: "Suspension",
                fields: [
                  {
                    name: "ride_height_mm",
                    type: "REAL",
                    description: "Suspension height (mm). May be null.",
                    example: 351.9
                  }
                ]
              },
              vehicle_motion: {
                description: "Vehicle motion",
                fields: [
                  {
                    name: "speed_kmh",
                    type: "TEXT",
                    description: "Vehicle speed, stored as text (sample values show m/s)",
                    example: "49.30 m/s"
                  },
                  {
                    name: "payload_kg",
                    type: "REAL",
                    description: "Vehicle load (kg). May be null.",
                    example: 9585.3
                  },
                  {
                    name: "attitude_angle_deg",
                    type: "REAL",
                    description: "Vehicle attitude angle (degrees)",
                    example: 1.6
                  },
                  {
                    name: "heading_deg",
                    type: "REAL",
                    description: "Vehicle heading (degrees)",
                    example: 89.3
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            CHASSIS_ID: 1,
            equipRef: "PE593707",
            trans_link: 1,
            engine_link: 1,
            ground_vehicle_status: {
              tires: {
                pressure_kpa: 345,
                temperature_c: 28.7,
                tread_depth_mm: 12.8
              },
              tracks: {
                wear_pct: 35,
                tension_kN: 21.9
              },
              suspension: {
                ride_height_mm: 351.9
              },
              brake_system: {
                pad_wear_pct: 69,
                fluid_level_pct: 97,
                pressure_kpa_or_code: "370.8 hPa"
              },
              vehicle_motion: {
                speed_kmh: "49.30 m/s",
                payload_kg: 9585.3,
                heading_deg: 89.3,
                attitude_angle_deg: 1.6
              }
            }
          },
          {
            CHASSIS_ID: 2,
            equipRef: "PE292528",
            trans_link: 2,
            engine_link: 2,
            ground_vehicle_status: {
              tires: {
                pressure_kpa: 441,
                temperature_c: -1.6,
                tread_depth_mm: 2.8
              },
              tracks: {
                wear_pct: null,
                tension_kN: 34.6
              },
              suspension: {
                ride_height_mm: 219.4
              },
              brake_system: {
                pad_wear_pct: 78,
                fluid_level_pct: 10,
                pressure_kpa_or_code: "616.0 hPa"
              },
              vehicle_motion: {
                speed_kmh: "39.60 m/s",
                payload_kg: 2335.2,
                heading_deg: 67.2,
                attitude_angle_deg: 40.1
              }
            }
          },
          {
            CHASSIS_ID: 3,
            equipRef: "PE617633",
            trans_link: 3,
            engine_link: 3,
            ground_vehicle_status: {
              tires: {
                pressure_kpa: 470,
                temperature_c: -4.3,
                tread_depth_mm: 18.2
              },
              tracks: {
                wear_pct: 47,
                tension_kN: 30.5
              },
              suspension: {
                ride_height_mm: 220.7
              },
              brake_system: {
                pad_wear_pct: 54,
                fluid_level_pct: 56,
                pressure_kpa_or_code: "847.0 hPa"
              },
              vehicle_motion: {
                speed_kmh: "55.40 m/s",
                payload_kg: null,
                heading_deg: 8.5,
                attitude_angle_deg: 44
              }
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "equipRef",
            references: {
              table: "Equipment",
              column: "EQUIP_CODE"
            }
          },
          {
            column: "trans_link",
            references: {
              table: "Transmission",
              column: "TRANS_ID"
            }
          },
          {
            column: "engine_link",
            references: {
              table: "EngineAndFluids",
              column: "ENGINE_ID"
            }
          }
        ]
      },
      {
        name: "Communication",
        role: "snapshot detail",
        description: "Connectivity health per equipment unit: GPS, satellite, radio, Wi-Fi, Bluetooth, antenna, latency and data rate.",
        primary_key: [
          "COMM_ID"
        ],
        columns: [
          {
            name: "COMM_ID",
            type: "bigint",
            description: "Unique communication record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "equipRef",
            type: "text",
            description: "Equipment",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "Equipment",
              column: "EQUIP_CODE"
            },
            example: "PE593707"
          },
          {
            name: "loc_link",
            type: "text",
            description: "Station where the unit is located",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "Location",
              column: "STATION_name"
            },
            example: "Station-14"
          },
          {
            name: "GPS_signal",
            type: "text",
            description: "GPS signal status. Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Medium",
              "Strong",
              "Weak"
            ]
          },
          {
            name: "sat_conn_stat",
            type: "text",
            description: "Satellite connection status. Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Connected",
              "Disconnected",
              "Limited"
            ]
          },
          {
            name: "radioSignal_dBm",
            type: "real",
            description: "Radio signal strength (dBm)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: -97.8
          },
          {
            name: "radioFreq_mhz",
            type: "real",
            description: "Radio frequency (MHz)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 731.2
          },
          {
            name: "antenna_stat",
            type: "text",
            description: "Antenna status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Error",
              "Normal",
              "Warning"
            ]
          },
          {
            name: "netLatency_ms",
            type: "real",
            description: "Network latency (ms)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 1006
          },
          {
            name: "dataRate_kbps",
            type: "real",
            description: "Data rate (kbps)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 389.6
          },
          {
            name: "wifiSignal_dBm",
            type: "real",
            description: "Wi-Fi signal strength (dBm). Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: -61.7
          },
          {
            name: "btStatus",
            type: "text",
            description: "Bluetooth status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Error",
              "Off",
              "On",
              "Pairing"
            ]
          },
          {
            name: "opmaint_link",
            type: "bigint",
            description: "Related operation / maintenance record",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "OperationMaintenance",
              column: "OP_MAINT_ID"
            }
          }
        ],
        sample_rows: [
          {
            COMM_ID: 1,
            equipRef: "PE593707",
            loc_link: "Station-14",
            GPS_signal: "Strong",
            sat_conn_stat: "Limited",
            radioSignal_dBm: -97.8,
            radioFreq_mhz: 731.2,
            antenna_stat: "Error",
            netLatency_ms: 1006,
            dataRate_kbps: 389.6,
            wifiSignal_dBm: null,
            btStatus: "On",
            opmaint_link: null
          },
          {
            COMM_ID: 2,
            equipRef: "PE292528",
            loc_link: "Station-8",
            GPS_signal: null,
            sat_conn_stat: "Limited",
            radioSignal_dBm: -61.7,
            radioFreq_mhz: 614.7,
            antenna_stat: "Normal",
            netLatency_ms: 984.1,
            dataRate_kbps: 575.5,
            wifiSignal_dBm: null,
            btStatus: "Error",
            opmaint_link: null
          },
          {
            COMM_ID: 3,
            equipRef: "PE617633",
            loc_link: "Station-19",
            GPS_signal: "Weak",
            sat_conn_stat: "Connected",
            radioSignal_dBm: -79.6,
            radioFreq_mhz: 779.8,
            antenna_stat: "Error",
            netLatency_ms: 1818.1,
            dataRate_kbps: 733.8,
            wifiSignal_dBm: -61.7,
            btStatus: "Error",
            opmaint_link: null
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "equipRef",
            references: {
              table: "Equipment",
              column: "EQUIP_CODE"
            }
          },
          {
            column: "loc_link",
            references: {
              table: "Location",
              column: "STATION_name"
            }
          },
          {
            column: "opmaint_link",
            references: {
              table: "OperationMaintenance",
              column: "OP_MAINT_ID"
            }
          }
        ]
      },
      {
        name: "CabinEnvironment",
        role: "snapshot detail",
        description: "Cabin air quality, HVAC, access (door, hatch, window) and emergency-beacon state as JSONB.",
        primary_key: [
          "CABIN_ID"
        ],
        columns: [
          {
            name: "CABIN_ID",
            type: "bigint",
            description: "Unique cabin record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "equipRef",
            type: "text",
            description: "Equipment",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "Equipment",
              column: "EQUIP_CODE"
            },
            example: "PE593707"
          },
          {
            name: "loc_link",
            type: "text",
            description: "Station",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "Location",
              column: "STATION_name"
            },
            example: "Station-14"
          },
          {
            name: "comm_link",
            type: "bigint",
            description: "Related communication record",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "Communication",
              column: "COMM_ID"
            }
          },
          {
            name: "cabin_env_snapshot",
            type: "jsonb",
            description: "Nested cabin conditions (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              root: {
                description: "Top-level field",
                fields: [
                  {
                    name: "emergency",
                    type: "TEXT",
                    description: "Emergency beacon status",
                    possible_values: [
                      "Active",
                      "Standby",
                      "Testing"
                    ]
                  }
                ]
              },
              air_metrics: {
                description: "Cabin air",
                fields: [
                  {
                    name: "temperature_c",
                    type: "REAL",
                    description: "Cabin temperature (°C). May be null.",
                    example: -0.3
                  },
                  {
                    name: "humidity_pct",
                    type: "REAL",
                    description: "Humidity (%)",
                    example: 58.8
                  },
                  {
                    name: "pressure_kpa",
                    type: "BIGINT",
                    description: "Cabin pressure (kPa)",
                    example: 99
                  },
                  {
                    name: "co2_ppm",
                    type: "REAL",
                    description: "CO2 (ppm)",
                    example: 557
                  },
                  {
                    name: "o2_pct",
                    type: "REAL",
                    description: "Oxygen (%)",
                    example: 19.9
                  },
                  {
                    name: "air_quality_idx",
                    type: "REAL",
                    description: "Air quality index",
                    example: 237
                  }
                ]
              },
              hvac: {
                description: "Heating, ventilation, defrost",
                fields: [
                  {
                    name: "vent_state",
                    type: "TEXT",
                    description: "Ventilation status. May be null.",
                    possible_values: [
                      "Auto",
                      "Off",
                      "On"
                    ]
                  },
                  {
                    name: "vent_speed_pct",
                    type: "REAL",
                    description: "Ventilation speed (%)",
                    example: 13
                  },
                  {
                    name: "heater_state",
                    type: "TEXT",
                    description: "Heater status",
                    possible_values: [
                      "Auto",
                      "Off",
                      "On"
                    ]
                  },
                  {
                    name: "heater_temp_c",
                    type: "REAL",
                    description: "Heater temperature (°C)",
                    example: 34.9
                  },
                  {
                    name: "defroster_state",
                    type: "TEXT",
                    description: "Defroster status",
                    possible_values: [
                      "Auto",
                      "Off",
                      "On"
                    ]
                  }
                ]
              },
              access: {
                description: "Entry points",
                fields: [
                  {
                    name: "window_state",
                    type: "TEXT",
                    description: "Window status",
                    possible_values: [
                      "Closed",
                      "Open",
                      "Partial"
                    ]
                  },
                  {
                    name: "door_state",
                    type: "TEXT",
                    description: "Door status",
                    possible_values: [
                      "Closed",
                      "Locked",
                      "Open"
                    ]
                  },
                  {
                    name: "hatch_state",
                    type: "TEXT",
                    description: "Hatch status",
                    possible_values: [
                      "Closed",
                      "Locked",
                      "Open"
                    ]
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            CABIN_ID: 1,
            equipRef: "PE593707",
            loc_link: "Station-14",
            comm_link: 1,
            cabin_env_snapshot: {
              hvac: {
                vent_state: "On",
                heater_state: "Off",
                heater_temp_c: 34.9,
                vent_speed_pct: 13,
                defroster_state: "On"
              },
              access: {
                door_state: "Closed",
                hatch_state: "Closed",
                window_state: "Partial"
              },
              emergency: "Active",
              air_metrics: {
                o2_pct: 19.9,
                co2_ppm: 557,
                humidity_pct: 58.8,
                pressure_kpa: 99,
                temperature_c: -0.3,
                air_quality_idx: 237
              }
            }
          },
          {
            CABIN_ID: 2,
            equipRef: "PE292528",
            loc_link: "Station-8",
            comm_link: 2,
            cabin_env_snapshot: {
              hvac: {
                vent_state: "Auto",
                heater_state: "On",
                heater_temp_c: 27,
                vent_speed_pct: 68,
                defroster_state: "Auto"
              },
              access: {
                door_state: "Closed",
                hatch_state: "Closed",
                window_state: "Closed"
              },
              emergency: "Standby",
              air_metrics: {
                o2_pct: 19.8,
                co2_ppm: 1343,
                humidity_pct: 86.4,
                pressure_kpa: 104,
                temperature_c: 9.9,
                air_quality_idx: 340
              }
            }
          },
          {
            CABIN_ID: 3,
            equipRef: "PE617633",
            loc_link: "Station-19",
            comm_link: 3,
            cabin_env_snapshot: {
              hvac: {
                vent_state: "On",
                heater_state: "On",
                heater_temp_c: 19.3,
                vent_speed_pct: 55,
                defroster_state: "On"
              },
              access: {
                door_state: "Locked",
                hatch_state: "Open",
                window_state: "Partial"
              },
              emergency: "Standby",
              air_metrics: {
                o2_pct: 20,
                co2_ppm: 930,
                humidity_pct: 46.1,
                pressure_kpa: 99,
                temperature_c: -15,
                air_quality_idx: 235
              }
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "equipRef",
            references: {
              table: "Equipment",
              column: "EQUIP_CODE"
            }
          },
          {
            column: "loc_link",
            references: {
              table: "Location",
              column: "STATION_name"
            }
          },
          {
            column: "comm_link",
            references: {
              table: "Communication",
              column: "COMM_ID"
            }
          }
        ]
      },
      {
        name: "LightingAndSafety",
        role: "snapshot detail",
        description: "Status of lighting, fire / smoke / CO / gas detection, alarms, life support, oxygen, medical equipment, waste and water supply per equipment unit.",
        primary_key: [
          "LIGHT_ID"
        ],
        columns: [
          {
            name: "LIGHT_ID",
            type: "bigint",
            description: "Unique lighting / safety record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "equipRef",
            type: "text",
            description: "Equipment",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "Equipment",
              column: "EQUIP_CODE"
            },
            example: "PE593707"
          },
          {
            name: "lightingStat",
            type: "text",
            description: "Lighting status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Auto",
              "Off",
              "On"
            ]
          },
          {
            name: "lightIntensityPct",
            type: "real",
            description: "Light intensity (%). Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 21
          },
          {
            name: "extLightStat",
            type: "text",
            description: "External lighting status. Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Auto",
              "Off",
              "On"
            ]
          },
          {
            name: "emerLightStat",
            type: "text",
            description: "Emergency light status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Off",
              "On",
              "Testing"
            ]
          },
          {
            name: "fireDetectStat",
            type: "text",
            description: "Fire detection status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Alert",
              "Fault",
              "Normal"
            ]
          },
          {
            name: "smokeDetectStat",
            type: "text",
            description: "Smoke detection status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Alert",
              "Fault",
              "Normal"
            ]
          },
          {
            name: "COdetectStat",
            type: "text",
            description: "CO detection status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Alert",
              "Fault",
              "Normal"
            ]
          },
          {
            name: "gasDetectStat",
            type: "text",
            description: "Gas detection status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Alert",
              "Fault",
              "Normal"
            ]
          },
          {
            name: "emerStopStat",
            type: "text",
            description: "Emergency stop status. Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Activated",
              "Ready",
              "Reset"
            ]
          },
          {
            name: "alarm_stat",
            type: "text",
            description: "Alarm system status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Critical",
              "Normal",
              "Warning"
            ]
          },
          {
            name: "safetySysStat",
            type: "text",
            description: "Safety system status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Active",
              "Fault",
              "Standby"
            ]
          },
          {
            name: "lifeSupportStat",
            type: "text",
            description: "Life support status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Critical",
              "Normal",
              "Warning"
            ]
          },
          {
            name: "O2SupplyStat",
            type: "text",
            description: "Oxygen supply status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Critical",
              "Normal",
              "Warning"
            ]
          },
          {
            name: "medEquipStat",
            type: "text",
            description: "Medical equipment status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Critical",
              "Normal",
              "Warning"
            ]
          },
          {
            name: "wasteMgmtStat",
            type: "text",
            description: "Waste management status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Critical",
              "Normal",
              "Warning"
            ]
          },
          {
            name: "waterSupplyStat",
            type: "text",
            description: "Water supply status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Critical",
              "Normal",
              "Warning"
            ]
          }
        ],
        sample_rows: [
          {
            LIGHT_ID: 1,
            equipRef: "PE593707",
            lightingStat: "Off",
            lightIntensityPct: 21,
            extLightStat: "Off",
            emerLightStat: "On",
            fireDetectStat: "Normal",
            smokeDetectStat: "Fault",
            COdetectStat: "Fault",
            gasDetectStat: "Alert",
            emerStopStat: "Activated",
            alarm_stat: "Normal",
            safetySysStat: "Fault",
            lifeSupportStat: "Warning",
            O2SupplyStat: "Warning",
            medEquipStat: "Normal",
            wasteMgmtStat: "Critical",
            waterSupplyStat: "Normal"
          },
          {
            LIGHT_ID: 2,
            equipRef: "PE292528",
            lightingStat: "Off",
            lightIntensityPct: 10,
            extLightStat: null,
            emerLightStat: "Off",
            fireDetectStat: "Alert",
            smokeDetectStat: "Alert",
            COdetectStat: "Alert",
            gasDetectStat: "Fault",
            emerStopStat: "Activated",
            alarm_stat: "Critical",
            safetySysStat: "Fault",
            lifeSupportStat: "Warning",
            O2SupplyStat: "Normal",
            medEquipStat: "Normal",
            wasteMgmtStat: "Critical",
            waterSupplyStat: "Warning"
          },
          {
            LIGHT_ID: 3,
            equipRef: "PE617633",
            lightingStat: "Off",
            lightIntensityPct: 96,
            extLightStat: "On",
            emerLightStat: "Off",
            fireDetectStat: "Normal",
            smokeDetectStat: "Normal",
            COdetectStat: "Fault",
            gasDetectStat: "Fault",
            emerStopStat: "Activated",
            alarm_stat: "Warning",
            safetySysStat: "Fault",
            lifeSupportStat: "Critical",
            O2SupplyStat: "Normal",
            medEquipStat: "Critical",
            wasteMgmtStat: "Critical",
            waterSupplyStat: "Critical"
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "equipRef",
            references: {
              table: "Equipment",
              column: "EQUIP_CODE"
            }
          }
        ]
      },
      {
        name: "WaterAndWaste",
        role: "snapshot detail",
        description: "Water level, pressure, temperature, flow and quality plus waste-tank fill per equipment unit.",
        primary_key: [
          "WATER_ID"
        ],
        columns: [
          {
            name: "WATER_ID",
            type: "bigint",
            description: "Unique water / waste record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "equipRef",
            type: "text",
            description: "Equipment",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "Equipment",
              column: "EQUIP_CODE"
            },
            example: "PE593707"
          },
          {
            name: "waterLevelPct",
            type: "real",
            description: "Water level (%)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 77
          },
          {
            name: "waterPress_kpa",
            type: "real",
            description: "Water pressure (kPa)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 66.4
          },
          {
            name: "waterTempC",
            type: "text",
            description: "Water temperature, stored as text with unit. Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "58.4 °C"
          },
          {
            name: "waterFlow_lpm",
            type: "real",
            description: "Water flow (L/min)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 28.6
          },
          {
            name: "waterQualityIdx",
            type: "bigint",
            description: "Water quality index",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 57
          },
          {
            name: "wasteTankPct",
            type: "real",
            description: "Waste tank fill (%)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 28
          }
        ],
        sample_rows: [
          {
            WATER_ID: 1,
            equipRef: "PE593707",
            waterLevelPct: 77,
            waterPress_kpa: 66.4,
            waterTempC: "58.4 °C",
            waterFlow_lpm: 28.6,
            waterQualityIdx: 57,
            wasteTankPct: 28
          },
          {
            WATER_ID: 2,
            equipRef: "PE292528",
            waterLevelPct: 24,
            waterPress_kpa: 403.4,
            waterTempC: "30.1 °C",
            waterFlow_lpm: 4.1,
            waterQualityIdx: 5,
            wasteTankPct: 45
          },
          {
            WATER_ID: 3,
            equipRef: "PE617633",
            waterLevelPct: 3,
            waterPress_kpa: 453.2,
            waterTempC: "20.3 °C",
            waterFlow_lpm: 28.7,
            waterQualityIdx: 58,
            wasteTankPct: 22
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "equipRef",
            references: {
              table: "Equipment",
              column: "EQUIP_CODE"
            }
          }
        ]
      },
      {
        name: "Scientific",
        role: "snapshot detail",
        description: "Status of scientific instruments: operation, data logging, sensors, calibration and measurement accuracy.",
        primary_key: [
          "SCI_ID"
        ],
        columns: [
          {
            name: "SCI_ID",
            type: "bigint",
            description: "Unique scientific record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "equipRef",
            type: "text",
            description: "Equipment",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "Equipment",
              column: "EQUIP_CODE"
            },
            example: "PE593707"
          },
          {
            name: "sciEquipStat",
            type: "text",
            description: "Scientific equipment status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Fault",
              "Operating",
              "Standby"
            ]
          },
          {
            name: "dataLogStat",
            type: "text",
            description: "Data logging status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Active",
              "Error",
              "Paused"
            ]
          },
          {
            name: "sensorStat",
            type: "text",
            description: "Sensor status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Error",
              "Normal",
              "Warning"
            ]
          },
          {
            name: "calibrStat",
            type: "text",
            description: "Calibration status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Due",
              "Expired",
              "Valid"
            ]
          },
          {
            name: "measureAccPct",
            type: "real",
            description: "Measurement accuracy (%)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 99.3
          }
        ],
        sample_rows: [
          {
            SCI_ID: 1,
            equipRef: "PE593707",
            sciEquipStat: "Standby",
            dataLogStat: "Active",
            sensorStat: "Error",
            calibrStat: "Expired",
            measureAccPct: 99.3
          },
          {
            SCI_ID: 2,
            equipRef: "PE292528",
            sciEquipStat: "Operating",
            dataLogStat: "Paused",
            sensorStat: "Error",
            calibrStat: "Valid",
            measureAccPct: 96
          },
          {
            SCI_ID: 3,
            equipRef: "PE617633",
            sciEquipStat: null,
            dataLogStat: "Active",
            sensorStat: "Warning",
            calibrStat: "Due",
            measureAccPct: 92.3
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "equipRef",
            references: {
              table: "Equipment",
              column: "EQUIP_CODE"
            }
          }
        ]
      },
      {
        name: "WeatherAndStructure",
        role: "snapshot detail",
        description: "Weather conditions at a station (temperature, wind, pressure, radiation, snow, ice, visibility, precipitation) and structural load, integrity, vibration and noise.",
        primary_key: [
          "WEATHER_ID"
        ],
        columns: [
          {
            name: "WEATHER_ID",
            type: "bigint",
            description: "Unique weather record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "loc_link",
            type: "text",
            description: "Station",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "Location",
              column: "STATION_name"
            },
            example: "Station-14"
          },
          {
            name: "opmaint_link",
            type: "bigint",
            description: "Related operation / maintenance record",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "OperationMaintenance",
              column: "OP_MAINT_ID"
            }
          },
          {
            name: "extTempC",
            type: "real",
            description: "External temperature (°C)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: -14.9
          },
          {
            name: "windSpeed_ms",
            type: "real",
            description: "Wind speed (m/s)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 26.5
          },
          {
            name: "windDir_deg",
            type: "real",
            description: "Wind direction (degrees). Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 71.4
          },
          {
            name: "baroPress_hpa",
            type: "real",
            description: "Barometric pressure (hPa)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 975.3
          },
          {
            name: "solarRad_wm2",
            type: "real",
            description: "Solar radiation (W/m²)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 541
          },
          {
            name: "snowDepth_cm",
            type: "bigint",
            description: "Snow depth (cm)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 144
          },
          {
            name: "iceThick_cm",
            type: "real",
            description: "Ice thickness (cm)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 254.4
          },
          {
            name: "visibility_km",
            type: "real",
            description: "Visibility (km)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 42.8
          },
          {
            name: "precipType",
            type: "text",
            description: "Precipitation type. Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Blowing Snow",
              "Ice",
              "Snow"
            ]
          },
          {
            name: "precipRate_mmh",
            type: "real",
            description: "Precipitation rate (mm/h)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 2.4
          },
          {
            name: "snowLoad_kgm2",
            type: "bigint",
            description: "Snow load (kg/m²)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 460
          },
          {
            name: "structLoadPct",
            type: "real",
            description: "Structural load (%)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 62
          },
          {
            name: "structIntegrityStat",
            type: "text",
            description: "Structural integrity status. Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Critical",
              "Normal",
              "Warning"
            ]
          },
          {
            name: "vibrLevel_mms2",
            type: "real",
            description: "Vibration level",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 8.61
          },
          {
            name: "noiseLevel_dB",
            type: "real",
            description: "Noise level (dB)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 38.5
          }
        ],
        sample_rows: [
          {
            WEATHER_ID: 1,
            loc_link: "Station-14",
            opmaint_link: 1,
            extTempC: -14.9,
            windSpeed_ms: 26.5,
            windDir_deg: 71.4,
            baroPress_hpa: 975.3,
            solarRad_wm2: 541,
            snowDepth_cm: 144,
            iceThick_cm: 254.4,
            visibility_km: 42.8,
            precipType: "Blowing Snow",
            precipRate_mmh: 2.4,
            snowLoad_kgm2: 460,
            structLoadPct: 62,
            structIntegrityStat: "Warning",
            vibrLevel_mms2: 8.61,
            noiseLevel_dB: 38.5
          },
          {
            WEATHER_ID: 2,
            loc_link: "Station-8",
            opmaint_link: 2,
            extTempC: -57.9,
            windSpeed_ms: 30.6,
            windDir_deg: 202.6,
            baroPress_hpa: 931.2,
            solarRad_wm2: 280.6,
            snowDepth_cm: 273,
            iceThick_cm: 123.6,
            visibility_km: 46.1,
            precipType: "Ice",
            precipRate_mmh: 4.7,
            snowLoad_kgm2: 111,
            structLoadPct: 40,
            structIntegrityStat: "Critical",
            vibrLevel_mms2: 5.85,
            noiseLevel_dB: 66
          },
          {
            WEATHER_ID: 3,
            loc_link: "Station-19",
            opmaint_link: 3,
            extTempC: -41.7,
            windSpeed_ms: 4.1,
            windDir_deg: 259.8,
            baroPress_hpa: 913,
            solarRad_wm2: 370.8,
            snowDepth_cm: 76,
            iceThick_cm: 282.6,
            visibility_km: 12,
            precipType: "Ice",
            precipRate_mmh: 12.3,
            snowLoad_kgm2: 400,
            structLoadPct: 48,
            structIntegrityStat: "Critical",
            vibrLevel_mms2: 0.31,
            noiseLevel_dB: 68
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "loc_link",
            references: {
              table: "Location",
              column: "STATION_name"
            }
          },
          {
            column: "opmaint_link",
            references: {
              table: "OperationMaintenance",
              column: "OP_MAINT_ID"
            }
          }
        ]
      },
      {
        name: "ThermalSolarWindAndGrid",
        role: "snapshot detail",
        description: "Renewable and backup power equipment: thermal imaging and insulation, solar panels, wind turbine, grid connection, backup power and hydrogen fuel cell.",
        primary_key: [
          "THERMAL_ID"
        ],
        columns: [
          {
            name: "THERMAL_ID",
            type: "bigint",
            description: "Unique record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "comm_link",
            type: "bigint",
            description: "Related communication record",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "Communication",
              column: "COMM_ID"
            }
          },
          {
            name: "batt_link",
            type: "bigint",
            description: "Related battery record",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "PowerBattery",
              column: "PWR_BATT_ID"
            }
          },
          {
            name: "thermalImgStat",
            type: "text",
            description: "Thermal image status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Critical",
              "Normal",
              "Warning"
            ]
          },
          {
            name: "insulationStat",
            type: "text",
            description: "Insulation status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Fair",
              "Good",
              "Poor"
            ]
          },
          {
            name: "heatLoss_kwh",
            type: "real",
            description: "Heat loss (kWh). Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 1.11
          },
          {
            name: "solarPanelStat",
            type: "text",
            description: "Solar panel status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Active",
              "Fault",
              "Inactive"
            ]
          },
          {
            name: "solarOutput_w",
            type: "real",
            description: "Solar output (W)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 746.1
          },
          {
            name: "solarEffPct",
            type: "real",
            description: "Solar efficiency (%)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 2
          },
          {
            name: "solarTempC",
            type: "real",
            description: "Solar panel temperature (°C)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: -14.9
          },
          {
            name: "windTurbineStat",
            type: "text",
            description: "Wind turbine status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Fault",
              "Operating",
              "Stopped"
            ]
          },
          {
            name: "windOutput_w",
            type: "real",
            description: "Wind turbine output (W). Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 656.8
          },
          {
            name: "windRPM",
            type: "bigint",
            description: "Wind turbine RPM",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 130
          },
          {
            name: "powerGridStat",
            type: "text",
            description: "Power grid status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Connected",
              "Disconnected",
              "Island Mode"
            ]
          },
          {
            name: "powerQualIdx",
            type: "real",
            description: "Power quality index",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 95
          },
          {
            name: "backupPowerStat",
            type: "text",
            description: "Backup power status. Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Active",
              "Fault",
              "Standby"
            ]
          },
          {
            name: "fuelCellStat",
            type: "text",
            description: "Fuel cell status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Fault",
              "Operating",
              "Standby"
            ]
          },
          {
            name: "fuelCellOutput_w",
            type: "real",
            description: "Fuel cell output (W)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 185
          },
          {
            name: "fuelCellEffPct",
            type: "real",
            description: "Fuel cell efficiency (%)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 48.2
          },
          {
            name: "H2LevelPct",
            type: "real",
            description: "Hydrogen level (%)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 95
          },
          {
            name: "O2LevelPct",
            type: "real",
            description: "Oxygen level (%)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 82
          }
        ],
        sample_rows: [
          {
            THERMAL_ID: 1,
            comm_link: 1,
            batt_link: 1,
            thermalImgStat: "Warning",
            insulationStat: "Fair",
            heatLoss_kwh: 1.11,
            solarPanelStat: "Fault",
            solarOutput_w: 746.1,
            solarEffPct: 2,
            solarTempC: -14.9,
            windTurbineStat: "Fault",
            windOutput_w: 656.8,
            windRPM: 130,
            powerGridStat: "Connected",
            powerQualIdx: 95,
            backupPowerStat: "Fault",
            fuelCellStat: "Standby",
            fuelCellOutput_w: 185,
            fuelCellEffPct: 48.2,
            H2LevelPct: 95,
            O2LevelPct: 82
          },
          {
            THERMAL_ID: 2,
            comm_link: 2,
            batt_link: 2,
            thermalImgStat: "Warning",
            insulationStat: "Poor",
            heatLoss_kwh: 8.47,
            solarPanelStat: "Inactive",
            solarOutput_w: 337.7,
            solarEffPct: 80.1,
            solarTempC: -16.1,
            windTurbineStat: "Operating",
            windOutput_w: 4084.9,
            windRPM: 221,
            powerGridStat: "Disconnected",
            powerQualIdx: 97,
            backupPowerStat: null,
            fuelCellStat: "Standby",
            fuelCellOutput_w: 2564,
            fuelCellEffPct: 42.1,
            H2LevelPct: 41,
            O2LevelPct: 68
          },
          {
            THERMAL_ID: 3,
            comm_link: 3,
            batt_link: 3,
            thermalImgStat: "Warning",
            insulationStat: "Good",
            heatLoss_kwh: null,
            solarPanelStat: "Active",
            solarOutput_w: 268,
            solarEffPct: 54.9,
            solarTempC: 14,
            windTurbineStat: "Stopped",
            windOutput_w: 4514.5,
            windRPM: 210,
            powerGridStat: "Connected",
            powerQualIdx: 61,
            backupPowerStat: "Active",
            fuelCellStat: "Fault",
            fuelCellOutput_w: 944,
            fuelCellEffPct: 41.3,
            H2LevelPct: 57,
            O2LevelPct: 27
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "comm_link",
            references: {
              table: "Communication",
              column: "COMM_ID"
            }
          },
          {
            column: "batt_link",
            references: {
              table: "PowerBattery",
              column: "PWR_BATT_ID"
            }
          }
        ]
      }
    ],
    relationships: [
      {
        from: "Equipment.EquipType",
        to: "EquipmentType.EquipType",
        type: "many-to-one",
        meaning: "Each Equipment row references one EquipmentType row"
      },
      {
        from: "StationEquipmentType.station_name",
        to: "Location.STATION_name",
        type: "many-to-one",
        meaning: "Each StationEquipmentType row references one Location row"
      },
      {
        from: "StationEquipmentType.equip_type",
        to: "EquipmentType.EquipType",
        type: "many-to-one",
        meaning: "Each StationEquipmentType row references one EquipmentType row"
      },
      {
        from: "OperationMaintenance.equipRef",
        to: "Equipment.EQUIP_CODE",
        type: "many-to-one",
        meaning: "Each OperationMaintenance row references one Equipment row"
      },
      {
        from: "PowerBattery.equip_ref",
        to: "Equipment.EQUIP_CODE",
        type: "many-to-one",
        meaning: "Each PowerBattery row references one Equipment row"
      },
      {
        from: "EngineAndFluids.equipRef",
        to: "Equipment.EQUIP_CODE",
        type: "many-to-one",
        meaning: "Each EngineAndFluids row references one Equipment row"
      },
      {
        from: "EngineAndFluids.batt_link",
        to: "PowerBattery.PWR_BATT_ID",
        type: "many-to-one",
        meaning: "Each EngineAndFluids row references one PowerBattery row"
      },
      {
        from: "EngineAndFluids.opmaint_link",
        to: "OperationMaintenance.OP_MAINT_ID",
        type: "many-to-one",
        meaning: "Each EngineAndFluids row references one OperationMaintenance row"
      },
      {
        from: "Transmission.equipRef",
        to: "Equipment.EQUIP_CODE",
        type: "many-to-one",
        meaning: "Each Transmission row references one Equipment row"
      },
      {
        from: "Transmission.engine_link",
        to: "EngineAndFluids.ENGINE_ID",
        type: "many-to-one",
        meaning: "Each Transmission row references one EngineAndFluids row"
      },
      {
        from: "Transmission.opmaint_link",
        to: "OperationMaintenance.OP_MAINT_ID",
        type: "many-to-one",
        meaning: "Each Transmission row references one OperationMaintenance row"
      },
      {
        from: "ChassisAndVehicle.equipRef",
        to: "Equipment.EQUIP_CODE",
        type: "many-to-one",
        meaning: "Each ChassisAndVehicle row references one Equipment row"
      },
      {
        from: "ChassisAndVehicle.trans_link",
        to: "Transmission.TRANS_ID",
        type: "many-to-one",
        meaning: "Each ChassisAndVehicle row references one Transmission row"
      },
      {
        from: "ChassisAndVehicle.engine_link",
        to: "EngineAndFluids.ENGINE_ID",
        type: "many-to-one",
        meaning: "Each ChassisAndVehicle row references one EngineAndFluids row"
      },
      {
        from: "Communication.equipRef",
        to: "Equipment.EQUIP_CODE",
        type: "many-to-one",
        meaning: "Each Communication row references one Equipment row"
      },
      {
        from: "Communication.loc_link",
        to: "Location.STATION_name",
        type: "many-to-one",
        meaning: "Each Communication row references one Location row"
      },
      {
        from: "Communication.opmaint_link",
        to: "OperationMaintenance.OP_MAINT_ID",
        type: "many-to-one",
        meaning: "Each Communication row references one OperationMaintenance row"
      },
      {
        from: "CabinEnvironment.equipRef",
        to: "Equipment.EQUIP_CODE",
        type: "many-to-one",
        meaning: "Each CabinEnvironment row references one Equipment row"
      },
      {
        from: "CabinEnvironment.loc_link",
        to: "Location.STATION_name",
        type: "many-to-one",
        meaning: "Each CabinEnvironment row references one Location row"
      },
      {
        from: "CabinEnvironment.comm_link",
        to: "Communication.COMM_ID",
        type: "many-to-one",
        meaning: "Each CabinEnvironment row references one Communication row"
      },
      {
        from: "LightingAndSafety.equipRef",
        to: "Equipment.EQUIP_CODE",
        type: "many-to-one",
        meaning: "Each LightingAndSafety row references one Equipment row"
      },
      {
        from: "WaterAndWaste.equipRef",
        to: "Equipment.EQUIP_CODE",
        type: "many-to-one",
        meaning: "Each WaterAndWaste row references one Equipment row"
      },
      {
        from: "Scientific.equipRef",
        to: "Equipment.EQUIP_CODE",
        type: "many-to-one",
        meaning: "Each Scientific row references one Equipment row"
      },
      {
        from: "WeatherAndStructure.loc_link",
        to: "Location.STATION_name",
        type: "many-to-one",
        meaning: "Each WeatherAndStructure row references one Location row"
      },
      {
        from: "WeatherAndStructure.opmaint_link",
        to: "OperationMaintenance.OP_MAINT_ID",
        type: "many-to-one",
        meaning: "Each WeatherAndStructure row references one OperationMaintenance row"
      },
      {
        from: "ThermalSolarWindAndGrid.comm_link",
        to: "Communication.COMM_ID",
        type: "many-to-one",
        meaning: "Each ThermalSolarWindAndGrid row references one Communication row"
      },
      {
        from: "ThermalSolarWindAndGrid.batt_link",
        to: "PowerBattery.PWR_BATT_ID",
        type: "many-to-one",
        meaning: "Each ThermalSolarWindAndGrid row references one PowerBattery row"
      }
    ]
  },
  {
    id: "museum_artifact",
    name: "Museum Artifact Conservation",
    domain: "Museum collections care / preventive conservation",
    description: "Conservation and exhibition data for a museum collection. Artifacts of different dynasties and materials are tracked through ratings, environmental sensitivity, showcase conditions, environmental, air-quality, surface and light readings, condition and risk assessments, maintenance records and usage requirements.",
    engine: "PostgreSQL",
    source: {
      benchmark: "BIRD-Interact (full)",
      dataset_url: "https://huggingface.co/datasets/birdsql/bird-interact-full",
      folder: "museum_artifact",
      paper: "https://arxiv.org/abs/2510.05318",
      license: "CC BY-SA 4.0",
      attribution: "BIRD Team & Google Cloud"
    },
    what_you_can_ask: [
      "Artifact condition, age, material and risk",
      "Environmental conditions inside showcases",
      "Light, UV and air-quality exposure",
      "Pest, mold and corrosion hazards",
      "Conservation treatment, cleaning and maintenance status",
      "Hall security and visitor statistics",
      "Insurance, loan and access status"
    ],
    stats: {
      table_count: 15,
      jsonb_column_count: 5,
      row_counts_note: "Row counts are null because the dump is not hosted on Hugging Face; fill after loading it."
    },
    tables: [
      {
        name: "ArtifactsCore",
        role: "core entity",
        description: "One row per museum artifact: title, dynasty, age, material and conservation status. Ratings, sensitivity, assessments and risk records attach to it.",
        primary_key: [
          "ARTregID"
        ],
        columns: [
          {
            name: "ARTregID",
            type: "text",
            description: "Unique artifact identifier",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: "ART54317"
          },
          {
            name: "art_title",
            type: "text",
            description: "Artifact title. Null = not provided.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Culture Painting"
          },
          {
            name: "DYNASTY",
            type: "text",
            description: "Dynasty / period",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Han",
              "Ming",
              "Qing",
              "Song",
              "Tang",
              "Yuan"
            ]
          },
          {
            name: "ageYears",
            type: "bigint",
            description: "Age of the artifact in years",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 943
          },
          {
            name: "MatKind",
            type: "text",
            description: "Material",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Bronze",
              "Ceramic",
              "Jade",
              "Paper",
              "Stone",
              "Textile",
              "Wood"
            ]
          },
          {
            name: "conserve_status",
            type: "text",
            description: "Conservation status. Null = not provided.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Critical",
              "Excellent",
              "Fair",
              "Good",
              "Poor"
            ]
          }
        ],
        sample_rows: [
          {
            ARTregID: "ART54317",
            art_title: "Culture Painting",
            DYNASTY: "Ming",
            ageYears: 943,
            MatKind: "Stone",
            conserve_status: "Good"
          },
          {
            ARTregID: "ART54254",
            art_title: "Poor Vase",
            DYNASTY: "Song",
            ageYears: 2179,
            MatKind: "Textile",
            conserve_status: "Fair"
          },
          {
            ARTregID: "ART69978",
            art_title: "Order Painting",
            DYNASTY: "Qing",
            ageYears: 366,
            MatKind: "Bronze",
            conserve_status: null
          }
        ],
        row_count: null,
        foreign_keys: []
      },
      {
        name: "ArtifactRatings",
        role: "snapshot detail",
        description: "Curatorial and conservation-planning ratings per artifact (research, exhibit, cultural, educational value, treatment complexity, stability, deterioration) as JSONB.",
        primary_key: [
          "HIST_sign"
        ],
        columns: [
          {
            name: "HIST_sign",
            type: "bigint",
            description: "Unique rating identifier (values 1 to 10)",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            possible_values: [
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10
            ]
          },
          {
            name: "ART_link",
            type: "text",
            description: "Artifact being rated",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "ArtifactsCore",
              column: "ARTregID"
            },
            example: "ART54317"
          },
          {
            name: "rating_profile",
            type: "jsonb",
            description: "Nested rating scores (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              root: {
                description: "Rating scores",
                fields: [
                  {
                    name: "research_score",
                    type: "BIGINT",
                    description: "Research score (1 to 10)"
                  },
                  {
                    name: "exhibit_value",
                    type: "BIGINT",
                    description: "Exhibition value score (1 to 10)"
                  },
                  {
                    name: "cultural_score",
                    type: "BIGINT",
                    description: "Cultural significance score",
                    example: 25
                  },
                  {
                    name: "public_access_rating",
                    type: "BIGINT",
                    description: "Public access rating (1 to 10)"
                  },
                  {
                    name: "educational_value",
                    type: "BIGINT",
                    description: "Educational value (1 to 10)"
                  },
                  {
                    name: "conservation_difficulty",
                    type: "TEXT",
                    description: "Conservation difficulty",
                    possible_values: [
                      "High",
                      "Low",
                      "Medium"
                    ]
                  },
                  {
                    name: "treatment_complexity",
                    type: "TEXT",
                    description: "Treatment complexity",
                    possible_values: [
                      "Complex",
                      "Moderate",
                      "Simple"
                    ]
                  },
                  {
                    name: "material_stability",
                    type: "TEXT",
                    description: "Material stability",
                    possible_values: [
                      "Moderate",
                      "Stable",
                      "Unstable"
                    ]
                  },
                  {
                    name: "deterioration_rate",
                    type: "TEXT",
                    description: "Rate of deterioration",
                    possible_values: [
                      "Moderate",
                      "Rapid",
                      "Slow"
                    ]
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            HIST_sign: 7,
            ART_link: "ART54317",
            rating_profile: {
              exhibit_value: 4,
              cultural_score: 25,
              research_score: 9,
              educational_value: 9,
              deterioration_rate: "Moderate",
              material_stability: "Unstable",
              public_access_rating: 9,
              treatment_complexity: "Complex",
              conservation_difficulty: "Medium"
            }
          },
          {
            HIST_sign: 3,
            ART_link: "ART54254",
            rating_profile: {
              exhibit_value: 7,
              cultural_score: 13,
              research_score: 5,
              educational_value: 3,
              deterioration_rate: "Rapid",
              material_stability: "Stable",
              public_access_rating: 1,
              treatment_complexity: "Moderate",
              conservation_difficulty: "High"
            }
          },
          {
            HIST_sign: 5,
            ART_link: "ART69978",
            rating_profile: {
              exhibit_value: null,
              cultural_score: 4,
              research_score: 10,
              educational_value: 3,
              deterioration_rate: "Rapid",
              material_stability: "Moderate",
              public_access_rating: null,
              treatment_complexity: "Moderate",
              conservation_difficulty: "High"
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "ART_link",
            references: {
              table: "ArtifactsCore",
              column: "ARTregID"
            }
          }
        ]
      },
      {
        name: "SensitivityData",
        role: "snapshot detail",
        description: "Multi-factor sensitivity profile per artifact (light, temperature, humidity, vibration, pollutants, pests, handling, transport, display, storage) used for preventive conservation.",
        primary_key: [
          "ENVsense"
        ],
        columns: [
          {
            name: "ENVsense",
            type: "text",
            description: "Environmental sensitivity level (primary key)",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            possible_values: [
              "High",
              "Low",
              "Medium"
            ]
          },
          {
            name: "ART_link",
            type: "text",
            description: "Artifact",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "ArtifactsCore",
              column: "ARTregID"
            },
            example: "ART54317"
          },
          {
            name: "env_handling_sensitivity",
            type: "jsonb",
            description: "Nested sensitivity levels (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              environment: {
                description: "Environmental sensitivity",
                fields: [
                  {
                    name: "light",
                    type: "TEXT",
                    description: "Light sensitivity. May be null.",
                    possible_values: [
                      "High",
                      "Low",
                      "Medium"
                    ]
                  },
                  {
                    name: "temperature",
                    type: "TEXT",
                    description: "Temperature sensitivity",
                    possible_values: [
                      "High",
                      "Low",
                      "Medium"
                    ]
                  },
                  {
                    name: "humidity",
                    type: "TEXT",
                    description: "Humidity sensitivity",
                    possible_values: [
                      "High",
                      "Low",
                      "Medium"
                    ]
                  },
                  {
                    name: "vibration",
                    type: "TEXT",
                    description: "Vibration sensitivity",
                    possible_values: [
                      "High",
                      "Low",
                      "Medium"
                    ]
                  },
                  {
                    name: "pollutants",
                    type: "TEXT",
                    description: "Pollutant sensitivity",
                    possible_values: [
                      "High",
                      "Low",
                      "Medium"
                    ]
                  }
                ]
              },
              biological: {
                description: "Biological",
                fields: [
                  {
                    name: "pest",
                    type: "TEXT",
                    description: "Pest sensitivity",
                    possible_values: [
                      "High",
                      "Low",
                      "Medium"
                    ]
                  }
                ]
              },
              handling_transport: {
                description: "Handling and transport",
                fields: [
                  {
                    name: "handling",
                    type: "TEXT",
                    description: "Handling sensitivity",
                    possible_values: [
                      "High",
                      "Low",
                      "Medium"
                    ]
                  },
                  {
                    name: "transport",
                    type: "TEXT",
                    description: "Transport sensitivity",
                    possible_values: [
                      "High",
                      "Low",
                      "Medium"
                    ]
                  }
                ]
              },
              context: {
                description: "Display and storage context",
                fields: [
                  {
                    name: "display",
                    type: "TEXT",
                    description: "Display sensitivity",
                    possible_values: [
                      "High",
                      "Low",
                      "Medium"
                    ]
                  },
                  {
                    name: "storage",
                    type: "TEXT",
                    description: "Storage sensitivity",
                    possible_values: [
                      "High",
                      "Low",
                      "Medium"
                    ]
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            ENVsense: "Low",
            ART_link: "ART54317",
            env_handling_sensitivity: {
              context: {
                display: "Low",
                storage: "Medium"
              },
              biological: {
                pest: null
              },
              environment: {
                light: "High",
                humidity: "Medium",
                vibration: "Medium",
                pollutants: null,
                temperature: null
              },
              handling_transport: {
                handling: "Medium",
                transport: "High"
              }
            }
          },
          {
            ENVsense: "High",
            ART_link: "ART54254",
            env_handling_sensitivity: {
              context: {
                display: "Low",
                storage: "Low"
              },
              biological: {
                pest: "Low"
              },
              environment: {
                light: "Low",
                humidity: "High",
                vibration: "High",
                pollutants: "Medium",
                temperature: "Low"
              },
              handling_transport: {
                handling: "Medium",
                transport: "High"
              }
            }
          },
          {
            ENVsense: "Medium",
            ART_link: "ART48028",
            env_handling_sensitivity: {
              context: {
                display: "High",
                storage: "Low"
              },
              biological: {
                pest: null
              },
              environment: {
                light: null,
                humidity: "Medium",
                vibration: "High",
                pollutants: "High",
                temperature: "Low"
              },
              handling_transport: {
                handling: "High",
                transport: "Low"
              }
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "ART_link",
            references: {
              table: "ArtifactsCore",
              column: "ARTregID"
            }
          }
        ]
      },
      {
        name: "ExhibitionHalls",
        role: "reference / lookup",
        description: "Exhibition halls with security system states and visitor statistics stored as JSONB.",
        primary_key: [
          "Hall_ID"
        ],
        columns: [
          {
            name: "Hall_ID",
            type: "text",
            description: "Unique hall identifier",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: "Hall-3"
          },
          {
            name: "security_visitor_overview",
            type: "jsonb",
            description: "Nested security and visitor data (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              security: {
                description: "Hall security systems",
                fields: [
                  {
                    name: "cctv_coverage",
                    type: "TEXT",
                    description: "CCTV coverage",
                    possible_values: [
                      "Full",
                      "Limited",
                      "Partial"
                    ]
                  },
                  {
                    name: "motion_detection",
                    type: "TEXT",
                    description: "Motion detection",
                    possible_values: [
                      "Active",
                      "Maintenance",
                      "Partial"
                    ]
                  },
                  {
                    name: "alarm_status",
                    type: "TEXT",
                    description: "Alarm system",
                    possible_values: [
                      "Armed",
                      "Maintenance",
                      "Partial"
                    ]
                  },
                  {
                    name: "access_control",
                    type: "TEXT",
                    description: "Access control",
                    possible_values: [
                      "Active",
                      "Maintenance",
                      "Partial"
                    ]
                  }
                ]
              },
              visitor_statistics: {
                description: "Visitor numbers",
                fields: [
                  {
                    name: "avg_daily_visitors",
                    type: "BIGINT",
                    description: "Daily visitors",
                    example: 308
                  },
                  {
                    name: "visitor_flow",
                    type: "TEXT",
                    description: "Visitor flow",
                    possible_values: [
                      "High",
                      "Low",
                      "Medium"
                    ]
                  },
                  {
                    name: "avg_dwell_minutes",
                    type: "BIGINT",
                    description: "Average dwell time in minutes",
                    example: 16
                  }
                ]
              },
              root: {
                description: "Top-level field",
                fields: [
                  {
                    name: "behaviour_notes",
                    type: "TEXT",
                    description: "Notes on visitor behaviour",
                    possible_values: [
                      "Fair",
                      "Good",
                      "Poor"
                    ]
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            Hall_ID: "Hall-3",
            security_visitor_overview: {
              security: {
                alarm_status: "Armed",
                cctv_coverage: null,
                access_control: "Maintenance",
                motion_detection: "Active"
              },
              behaviour_notes: "Poor",
              visitor_statistics: {
                visitor_flow: "Low",
                avg_dwell_minutes: 16,
                avg_daily_visitors: 308
              }
            }
          },
          {
            Hall_ID: "Hall-12",
            security_visitor_overview: {
              security: {
                alarm_status: "Armed",
                cctv_coverage: "Full",
                access_control: "Active",
                motion_detection: "Maintenance"
              },
              behaviour_notes: "Poor",
              visitor_statistics: {
                visitor_flow: "Low",
                avg_dwell_minutes: 11,
                avg_daily_visitors: 993
              }
            }
          },
          {
            Hall_ID: "Hall-9",
            security_visitor_overview: {
              security: {
                alarm_status: "Partial",
                cctv_coverage: "Full",
                access_control: "Maintenance",
                motion_detection: "Partial"
              },
              behaviour_notes: "Poor",
              visitor_statistics: {
                visitor_flow: "High",
                avg_dwell_minutes: 6,
                avg_daily_visitors: 888
              }
            }
          }
        ],
        row_count: null,
        foreign_keys: []
      },
      {
        name: "Showcases",
        role: "core entity",
        description: "Display cases located in exhibition halls, with physical state, maintenance, buffer capacity and safety / power states as JSONB.",
        primary_key: [
          "caseID"
        ],
        columns: [
          {
            name: "caseID",
            type: "text",
            description: "Unique showcase identifier",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: "SC9857"
          },
          {
            name: "hall_ref",
            type: "text",
            description: "Hall containing the showcase",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "ExhibitionHalls",
              column: "Hall_ID"
            },
            example: "Hall-3"
          },
          {
            name: "case_environment_profile",
            type: "jsonb",
            description: "Nested showcase profile (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              physical_state: {
                description: "Physical condition",
                fields: [
                  {
                    name: "airtightness_factor",
                    type: "REAL",
                    description: "Airtightness level",
                    example: 95.1
                  },
                  {
                    name: "construction_material",
                    type: "TEXT",
                    description: "Construction material. May be null.",
                    possible_values: [
                      "Acrylic",
                      "Glass",
                      "Tempered Glass"
                    ]
                  },
                  {
                    name: "seal_state",
                    type: "TEXT",
                    description: "Seal state",
                    possible_values: [
                      "Excellent",
                      "Fair",
                      "Good",
                      "Poor"
                    ]
                  },
                  {
                    name: "leak_rate_per_day",
                    type: "REAL",
                    description: "Leak rate per day",
                    example: 0.41
                  },
                  {
                    name: "internal_pressure_pa",
                    type: "BIGINT",
                    description: "Internal pressure (Pa)",
                    example: -3
                  }
                ]
              },
              maintenance: {
                description: "Maintenance",
                fields: [
                  {
                    name: "maint_status",
                    type: "TEXT",
                    description: "Maintenance status",
                    possible_values: [
                      "Due",
                      "Good",
                      "Overdue"
                    ]
                  },
                  {
                    name: "filter_status",
                    type: "TEXT",
                    description: "Filter status",
                    possible_values: [
                      "Clean",
                      "Replace Now",
                      "Replace Soon"
                    ]
                  },
                  {
                    name: "silica_status",
                    type: "TEXT",
                    description: "Silica gel status",
                    possible_values: [
                      "Active",
                      "Replace Now",
                      "Replace Soon"
                    ]
                  },
                  {
                    name: "silica_last_replaced",
                    type: "DATE (as text)",
                    description: "Date silica gel was last replaced",
                    example: "2024-09-15"
                  }
                ]
              },
              buffer_capacity: {
                description: "Buffer capacity",
                fields: [
                  {
                    name: "humidity_capacity_g",
                    type: "BIGINT",
                    description: "Humidity buffer capacity (g)",
                    example: 81
                  },
                  {
                    name: "pollutant_capacity_mg",
                    type: "REAL",
                    description: "Pollutant buffer capacity (mg)",
                    example: 79.8
                  }
                ]
              },
              safety_and_power: {
                description: "Safety and power",
                fields: [
                  {
                    name: "inert_gas_state",
                    type: "TEXT",
                    description: "Inert gas system",
                    possible_values: [
                      "Active",
                      "Maintenance",
                      "Standby"
                    ]
                  },
                  {
                    name: "fire_system_state",
                    type: "TEXT",
                    description: "Fire system",
                    possible_values: [
                      "Active",
                      "Maintenance",
                      "Standby"
                    ]
                  },
                  {
                    name: "primary_power_state",
                    type: "TEXT",
                    description: "Primary power",
                    possible_values: [
                      "Active",
                      "Standby",
                      "Testing"
                    ]
                  },
                  {
                    name: "backup_power_state",
                    type: "TEXT",
                    description: "Backup power",
                    possible_values: [
                      "Maintenance",
                      "Ready",
                      "Testing"
                    ]
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            caseID: "SC9857",
            hall_ref: "Hall-3",
            case_environment_profile: {
              maintenance: {
                maint_status: "Overdue",
                filter_status: "Replace Now",
                silica_status: "Active",
                silica_last_replaced: "2024-09-15"
              },
              physical_state: {
                seal_state: null,
                leak_rate_per_day: 0.41,
                airtightness_factor: 95.1,
                internal_pressure_pa: -3,
                construction_material: "Tempered Glass"
              },
              buffer_capacity: {
                humidity_capacity_g: 81,
                pollutant_capacity_mg: null
              },
              safety_and_power: {
                inert_gas_state: "Active",
                fire_system_state: "Maintenance",
                backup_power_state: "Ready",
                primary_power_state: "Testing"
              }
            }
          },
          {
            caseID: "SC7393",
            hall_ref: "Hall-12",
            case_environment_profile: {
              maintenance: {
                maint_status: "Overdue",
                filter_status: "Replace Now",
                silica_status: "Active",
                silica_last_replaced: "2024-12-15"
              },
              physical_state: {
                seal_state: "Excellent",
                leak_rate_per_day: 0.07,
                airtightness_factor: 93,
                internal_pressure_pa: 3,
                construction_material: "Tempered Glass"
              },
              buffer_capacity: {
                humidity_capacity_g: 78,
                pollutant_capacity_mg: 79.8
              },
              safety_and_power: {
                inert_gas_state: "Standby",
                fire_system_state: "Active",
                backup_power_state: "Maintenance",
                primary_power_state: "Active"
              }
            }
          },
          {
            caseID: "SC9391",
            hall_ref: "Hall-3",
            case_environment_profile: {
              maintenance: {
                maint_status: "Due",
                filter_status: "Replace Soon",
                silica_status: "Replace Soon",
                silica_last_replaced: "2024-12-21"
              },
              physical_state: {
                seal_state: "Good",
                leak_rate_per_day: 0.2,
                airtightness_factor: 99.4,
                internal_pressure_pa: -4,
                construction_material: "Glass"
              },
              buffer_capacity: {
                humidity_capacity_g: 93,
                pollutant_capacity_mg: 66.3
              },
              safety_and_power: {
                inert_gas_state: "Active",
                fire_system_state: "Active",
                backup_power_state: "Testing",
                primary_power_state: "Active"
              }
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "hall_ref",
            references: {
              table: "ExhibitionHalls",
              column: "Hall_ID"
            }
          }
        ]
      },
      {
        name: "EnvironmentalReadingsCore",
        role: "snapshot hub",
        description: "Timestamped temperature, humidity and air-pressure readings per showcase. Hub table: air quality, surface, light, maintenance and usage records attach to it via monitor_code.",
        primary_key: [
          "monitor_code"
        ],
        columns: [
          {
            name: "monitor_code",
            type: "text",
            description: "Unique environmental reading identifier",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: "MM191823"
          },
          {
            name: "readTS",
            type: "timestamp without time zone",
            description: "When the reading was taken",
            nullable: false,
            is_primary_key: false,
            foreign_key: null,
            example: "2024-08-06 08:38:48"
          },
          {
            name: "case_link",
            type: "text",
            description: "Showcase measured",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "Showcases",
              column: "caseID"
            },
            example: "SC9857"
          },
          {
            name: "TEMPc",
            type: "bigint",
            description: "Temperature (°C). Null = not available.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 22
          },
          {
            name: "tempVar24",
            type: "real",
            description: "Temperature variation over 24 h. Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 0.85
          },
          {
            name: "RH",
            type: "bigint",
            description: "Relative humidity (%)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 53
          },
          {
            name: "RHvar",
            type: "bigint",
            description: "Relative humidity variation. Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 3
          },
          {
            name: "air_press",
            type: "real",
            description: "Air pressure (hPa). Null = not available.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 1020
          }
        ],
        sample_rows: [
          {
            monitor_code: "MM191823",
            readTS: "2024-08-06 08:38:48",
            case_link: "SC9857",
            TEMPc: 22,
            tempVar24: 0.85,
            RH: 53,
            RHvar: 3,
            air_press: 1020
          },
          {
            monitor_code: "MM153427",
            readTS: "2025-02-07 03:00:17",
            case_link: "SC7393",
            TEMPc: 18,
            tempVar24: 1.34,
            RH: 54,
            RHvar: 1,
            air_press: 1013.4
          },
          {
            monitor_code: "MM675303",
            readTS: "2024-07-25 09:37:21",
            case_link: "SC9391",
            TEMPc: null,
            tempVar24: 1.75,
            RH: 48,
            RHvar: 2,
            air_press: 1015.3
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "case_link",
            references: {
              table: "Showcases",
              column: "caseID"
            }
          }
        ]
      },
      {
        name: "AirQualityReadings",
        role: "snapshot detail",
        description: "Gas, particulate and air-flow measurements for an environmental reading, stored as JSONB.",
        primary_key: [
          "aq_id"
        ],
        columns: [
          {
            name: "aq_id",
            type: "bigint",
            description: "Unique air quality reading id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "env_link",
            type: "text",
            description: "Environmental reading",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "EnvironmentalReadingsCore",
              column: "monitor_code"
            },
            example: "MM191823"
          },
          {
            name: "air_quality_metrics",
            type: "jsonb",
            description: "Nested air quality data (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              gases_ppm_ppb: {
                description: "Gas concentrations",
                fields: [
                  {
                    name: "co2_ppm",
                    type: "TEXT",
                    description: "CO2 in ppm, stored as text with unit. May be null.",
                    example: "794 ppm"
                  },
                  {
                    name: "tvoc_ppb",
                    type: "BIGINT",
                    description: "Total volatile organic compounds (ppb)",
                    example: 89
                  },
                  {
                    name: "ozone_ppb",
                    type: "BIGINT",
                    description: "Ozone (ppb)",
                    example: 11
                  },
                  {
                    name: "so2_ppb",
                    type: "BIGINT",
                    description: "Sulphur dioxide (ppb)",
                    example: 12
                  },
                  {
                    name: "no2_ppb",
                    type: "BIGINT",
                    description: "Nitrogen dioxide (ppb)",
                    example: 27
                  },
                  {
                    name: "formaldehyde_mg_m3",
                    type: "REAL",
                    description: "Formaldehyde concentration",
                    example: 0.014
                  }
                ]
              },
              particulates: {
                description: "Particulate matter",
                fields: [
                  {
                    name: "pm25_ug_m3",
                    type: "REAL",
                    description: "PM2.5 (µg/m³)",
                    example: 16.7
                  },
                  {
                    name: "pm10_ug_m3",
                    type: "REAL",
                    description: "PM10 (µg/m³). May be null.",
                    example: 29
                  }
                ]
              },
              air_flow: {
                description: "Air flow",
                fields: [
                  {
                    name: "air_exchange_rate_h",
                    type: "REAL",
                    description: "Air exchange rate. May be null.",
                    example: 6.4
                  },
                  {
                    name: "air_velocity_ms",
                    type: "REAL",
                    description: "Air velocity (m/s). May be null.",
                    example: 0.18
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            aq_id: 1,
            env_link: "MM191823",
            air_quality_metrics: {
              air_flow: {
                air_velocity_ms: 0.18,
                air_exchange_rate_h: 6.4
              },
              particulates: {
                pm10_ug_m3: null,
                pm25_ug_m3: 16.7
              },
              gases_ppm_ppb: {
                co2_ppm: "794 ppm",
                no2_ppb: 27,
                so2_ppb: 12,
                tvoc_ppb: 89,
                ozone_ppb: 11,
                formaldehyde_mg_m3: 0.014
              }
            }
          },
          {
            aq_id: 2,
            env_link: "MM153427",
            air_quality_metrics: {
              air_flow: {
                air_velocity_ms: 0.19,
                air_exchange_rate_h: 4.3
              },
              particulates: {
                pm10_ug_m3: null,
                pm25_ug_m3: 10.7
              },
              gases_ppm_ppb: {
                co2_ppm: "539 ppm",
                no2_ppb: 21,
                so2_ppb: 18,
                tvoc_ppb: 420,
                ozone_ppb: 12,
                formaldehyde_mg_m3: 0.035
              }
            }
          },
          {
            aq_id: 3,
            env_link: "MM675303",
            air_quality_metrics: {
              air_flow: {
                air_velocity_ms: 0.14,
                air_exchange_rate_h: null
              },
              particulates: {
                pm10_ug_m3: 29,
                pm25_ug_m3: 5.4
              },
              gases_ppm_ppb: {
                co2_ppm: "402 ppm",
                no2_ppb: 13,
                so2_ppb: 14,
                tvoc_ppb: 393,
                ozone_ppb: 47,
                formaldehyde_mg_m3: 0.077
              }
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "env_link",
            references: {
              table: "EnvironmentalReadingsCore",
              column: "monitor_code"
            }
          }
        ]
      },
      {
        name: "SurfaceAndPhysicalReadings",
        role: "snapshot detail",
        description: "Vibration, noise, dust, microbes, mold, pests, surface chemistry, corrosion, colour change, structural stability and gas composition around an artifact surface.",
        primary_key: [
          "surf_id"
        ],
        columns: [
          {
            name: "surf_id",
            type: "bigint",
            description: "Unique surface reading id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "env_link",
            type: "text",
            description: "Environmental reading",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "EnvironmentalReadingsCore",
              column: "monitor_code"
            },
            example: "MM191823"
          },
          {
            name: "vibra_mms2",
            type: "real",
            description: "Vibration measurement",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 0.461
          },
          {
            name: "noise_dB",
            type: "bigint",
            description: "Noise level (dB)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 47
          },
          {
            name: "dust_Mg_m2",
            type: "real",
            description: "Dust level (mg/m²)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 1.74
          },
          {
            name: "microbe_CFU",
            type: "bigint",
            description: "Microbial colony-forming units",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 234
          },
          {
            name: "moldIdx",
            type: "real",
            description: "Mold index",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 0.1
          },
          {
            name: "pestActivity",
            type: "text",
            description: "Pest activity level. Null = none reported.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "High",
              "Low",
              "Medium"
            ]
          },
          {
            name: "pestTrap",
            type: "bigint",
            description: "Number of pest traps",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 10
          },
          {
            name: "pestSpecies",
            type: "text",
            description: "Pest species detected. Null = none identified.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Beetles",
              "Booklice",
              "Moths",
              "Silverfish"
            ]
          },
          {
            name: "surface_pH",
            type: "real",
            description: "Surface pH",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 6.7
          },
          {
            name: "moist_pct",
            type: "real",
            description: "Surface moisture (%)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 10.3
          },
          {
            name: "saltRisk",
            type: "text",
            description: "Salt exposure risk",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "High",
              "Low",
              "Medium"
            ]
          },
          {
            name: "metalCorr",
            type: "real",
            description: "Metal corrosion rate",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 0.04
          },
          {
            name: "organicDeg",
            type: "real",
            description: "Organic degradation rate",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 0.47
          },
          {
            name: "deltaE",
            type: "real",
            description: "Colour difference (ΔE) due to environment",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 1.99
          },
          {
            name: "surfTemp",
            type: "real",
            description: "Surface temperature",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 19.11
          },
          {
            name: "surfRH",
            type: "real",
            description: "Surface relative humidity",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 45.46
          },
          {
            name: "condRisk",
            type: "text",
            description: "Damage risk from environmental conditions",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "High",
              "Low",
              "Medium"
            ]
          },
          {
            name: "thermalImg",
            type: "text",
            description: "Thermal image result. Null = none provided.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Attention Required",
              "Critical",
              "Normal"
            ]
          },
          {
            name: "structStable",
            type: "text",
            description: "Structural stability. Null = none provided.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Major Issues",
              "Minor Issues",
              "Stable"
            ]
          },
          {
            name: "crackNote",
            type: "text",
            description: "Crack observation",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Minor Changes",
              "No Changes",
              "Significant Changes"
            ]
          },
          {
            name: "deform_mm",
            type: "real",
            description: "Deformation (mm)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 0.08
          },
          {
            name: "wtPct",
            type: "real",
            description: "Weight change (%)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: -0.001
          },
          {
            name: "surfDust",
            type: "bigint",
            description: "Dust on the surface",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 6
          },
          {
            name: "O2_pct",
            type: "real",
            description: "Oxygen (%)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 20.8
          },
          {
            name: "N2_pct",
            type: "real",
            description: "Nitrogen (%)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 78.75
          }
        ],
        sample_rows: [
          {
            surf_id: 1,
            env_link: "MM191823",
            vibra_mms2: 0.461,
            noise_dB: 47,
            dust_Mg_m2: 1.74,
            microbe_CFU: 234,
            moldIdx: 0.1,
            pestActivity: "Medium",
            pestTrap: 10,
            pestSpecies: null,
            surface_pH: 6.7,
            moist_pct: 10.3,
            saltRisk: "High",
            metalCorr: 0.04,
            organicDeg: 0.47,
            deltaE: 1.99,
            surfTemp: 19.11,
            surfRH: 45.46,
            condRisk: "Medium",
            thermalImg: "Normal",
            structStable: "Stable",
            crackNote: "Significant Changes",
            deform_mm: 0.08,
            wtPct: -0.001,
            surfDust: 6,
            O2_pct: 20.8,
            N2_pct: 78.75
          },
          {
            surf_id: 2,
            env_link: "MM153427",
            vibra_mms2: 0.053,
            noise_dB: 50,
            dust_Mg_m2: 0.39,
            microbe_CFU: 450,
            moldIdx: 0.33,
            pestActivity: "Low",
            pestTrap: 6,
            pestSpecies: null,
            surface_pH: 6.5,
            moist_pct: 11,
            saltRisk: "High",
            metalCorr: 0.05,
            organicDeg: 0.37,
            deltaE: 0.87,
            surfTemp: null,
            surfRH: 52.95,
            condRisk: null,
            thermalImg: "Critical",
            structStable: "Stable",
            crackNote: "Significant Changes",
            deform_mm: null,
            wtPct: -0.011,
            surfDust: 4,
            O2_pct: 20.53,
            N2_pct: 78.3
          },
          {
            surf_id: 3,
            env_link: "MM675303",
            vibra_mms2: 0.018,
            noise_dB: 42,
            dust_Mg_m2: 2.77,
            microbe_CFU: 486,
            moldIdx: 0.43,
            pestActivity: "Low",
            pestTrap: 7,
            pestSpecies: null,
            surface_pH: 6.6,
            moist_pct: null,
            saltRisk: null,
            metalCorr: null,
            organicDeg: 0.92,
            deltaE: 1.48,
            surfTemp: 20.53,
            surfRH: 54.81,
            condRisk: null,
            thermalImg: "Critical",
            structStable: "Stable",
            crackNote: "Minor Changes",
            deform_mm: 0.16,
            wtPct: null,
            surfDust: 4,
            O2_pct: 20.31,
            N2_pct: 78.62
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "env_link",
            references: {
              table: "EnvironmentalReadingsCore",
              column: "monitor_code"
            }
          }
        ]
      },
      {
        name: "LightAndRadiationReadings",
        role: "snapshot detail",
        description: "Light intensity, UV, infrared and cumulative visible-light exposure for an environmental reading.",
        primary_key: [
          "rad_id"
        ],
        columns: [
          {
            name: "rad_id",
            type: "bigint",
            description: "Unique light reading id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "env_link",
            type: "text",
            description: "Environmental reading",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "EnvironmentalReadingsCore",
              column: "monitor_code"
            },
            example: "MM191823"
          },
          {
            name: "lux",
            type: "bigint",
            description: "Light intensity (lux). May be null.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 138
          },
          {
            name: "UV_uW",
            type: "real",
            description: "Ultraviolet radiation (µW)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 32.58
          },
          {
            name: "IR_W",
            type: "real",
            description: "Infrared radiation (W)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 7.51
          },
          {
            name: "visLxh",
            type: "bigint",
            description: "Visible light exposure (lux-hours)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 71166
          }
        ],
        sample_rows: [
          {
            rad_id: 1,
            env_link: "MM191823",
            lux: null,
            UV_uW: 32.58,
            IR_W: 7.51,
            visLxh: 71166
          },
          {
            rad_id: 2,
            env_link: "MM153427",
            lux: 138,
            UV_uW: 64.99,
            IR_W: 7.81,
            visLxh: 69438
          },
          {
            rad_id: 3,
            env_link: "MM675303",
            lux: 71,
            UV_uW: 66.82,
            IR_W: 5.47,
            visLxh: 75541
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "env_link",
            references: {
              table: "EnvironmentalReadingsCore",
              column: "monitor_code"
            }
          }
        ]
      },
      {
        name: "ConditionAssessments",
        role: "event log",
        description: "Condition assessments linking an artifact, its showcase and a light reading, with score, assessment date and next due date.",
        primary_key: [
          "cond_id"
        ],
        columns: [
          {
            name: "cond_id",
            type: "bigint",
            description: "Unique assessment id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "art_exam",
            type: "text",
            description: "Artifact examined",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "ArtifactsCore",
              column: "ARTregID"
            },
            example: "ART54317"
          },
          {
            name: "case_exam",
            type: "text",
            description: "Showcase examined",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "Showcases",
              column: "caseID"
            },
            example: "SC9857"
          },
          {
            name: "light_link",
            type: "bigint",
            description: "Related light and radiation reading",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "LightAndRadiationReadings",
              column: "rad_id"
            }
          },
          {
            name: "score",
            type: "bigint",
            description: "Condition assessment score",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 93
          },
          {
            name: "assess_date",
            type: "date",
            description: "Date of the assessment",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "2024-09-15"
          },
          {
            name: "next_due",
            type: "date",
            description: "Date next assessment is due",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "2025-04-17"
          }
        ],
        sample_rows: [
          {
            cond_id: 1,
            art_exam: "ART54317",
            case_exam: "SC9857",
            light_link: 1,
            score: 93,
            assess_date: "2024-09-15",
            next_due: "2025-04-17"
          },
          {
            cond_id: 2,
            art_exam: "ART54254",
            case_exam: "SC7393",
            light_link: 2,
            score: 48,
            assess_date: "2024-03-27",
            next_due: "2025-09-09"
          },
          {
            cond_id: 3,
            art_exam: "ART69978",
            case_exam: "SC9391",
            light_link: 3,
            score: 61,
            assess_date: "2024-05-01",
            next_due: "2025-11-10"
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "art_exam",
            references: {
              table: "ArtifactsCore",
              column: "ARTregID"
            }
          },
          {
            column: "case_exam",
            references: {
              table: "Showcases",
              column: "caseID"
            }
          },
          {
            column: "light_link",
            references: {
              table: "LightAndRadiationReadings",
              column: "rad_id"
            }
          }
        ]
      },
      {
        name: "RiskAssessments",
        role: "event log",
        description: "Risk level, emergency plan state, evacuation priority and handling rules for an artifact in a hall.",
        primary_key: [
          "risk_id"
        ],
        columns: [
          {
            name: "risk_id",
            type: "text",
            description: "Unique risk assessment id",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: "11X1B3CW"
          },
          {
            name: "art_concern",
            type: "text",
            description: "Artifact assessed",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "ArtifactsCore",
              column: "ARTregID"
            },
            example: "ART54317"
          },
          {
            name: "hall_concern",
            type: "text",
            description: "Hall assessed",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "ExhibitionHalls",
              column: "Hall_ID"
            },
            example: "Hall-3"
          },
          {
            name: "risk_level",
            type: "text",
            description: "Risk level",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "High",
              "Low",
              "Medium"
            ]
          },
          {
            name: "emerg_plan",
            type: "text",
            description: "Emergency plan state",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Review Required",
              "Under Revision",
              "Updated"
            ]
          },
          {
            name: "evacPrio",
            type: "text",
            description: "Evacuation priority",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Priority 1",
              "Priority 2",
              "Priority 3"
            ]
          },
          {
            name: "handle_rules",
            type: "text",
            description: "Handling rules",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Minimal",
              "Strict"
            ]
          },
          {
            name: "conserve_score",
            type: "bigint",
            description: "Conservation score",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 85
          }
        ],
        sample_rows: [
          {
            risk_id: "11X1B3CW",
            art_concern: "ART54317",
            hall_concern: "Hall-3",
            risk_level: "Medium",
            emerg_plan: "Review Required",
            evacPrio: "Priority 3",
            handle_rules: "Minimal",
            conserve_score: 85
          },
          {
            risk_id: "WE7WL5Y2",
            art_concern: "ART54254",
            hall_concern: "Hall-12",
            risk_level: "Medium",
            emerg_plan: "Under Revision",
            evacPrio: "Priority 1",
            handle_rules: "Strict",
            conserve_score: 76
          },
          {
            risk_id: "2248Y534",
            art_concern: "ART69978",
            hall_concern: "Hall-3",
            risk_level: "Medium",
            emerg_plan: null,
            evacPrio: "Priority 2",
            handle_rules: "Minimal",
            conserve_score: 91
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "art_concern",
            references: {
              table: "ArtifactsCore",
              column: "ARTregID"
            }
          },
          {
            column: "hall_concern",
            references: {
              table: "ExhibitionHalls",
              column: "Hall_ID"
            }
          }
        ]
      },
      {
        name: "ConservationAndMaintenance",
        role: "event log",
        description: "Conservation treatment and maintenance records: treatment status, priority, cleaning dates, incident / drill / training status, budget, history and treatment effectiveness.",
        primary_key: [
          "maint_id"
        ],
        columns: [
          {
            name: "maint_id",
            type: "bigint",
            description: "Unique maintenance record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "monitor_link",
            type: "text",
            description: "Related environmental reading",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "EnvironmentalReadingsCore",
              column: "monitor_code"
            },
            example: "MM191823"
          },
          {
            name: "surf_link",
            type: "bigint",
            description: "Related surface reading",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "SurfaceAndPhysicalReadings",
              column: "surf_id"
            }
          },
          {
            name: "treat_stat",
            type: "text",
            description: "Treatment status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "In Progress",
              "Not Required",
              "Scheduled"
            ]
          },
          {
            name: "prio_tag",
            type: "text",
            description: "Priority tag",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "High",
              "Low",
              "Medium",
              "Urgent"
            ]
          },
          {
            name: "lastClean",
            type: "date",
            description: "Last cleaning date",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "2024-12-16"
          },
          {
            name: "nextClean",
            type: "date",
            description: "Next cleaning due",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "2025-05-10"
          },
          {
            name: "cleanDays",
            type: "bigint",
            description: "Days since last cleaning",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 83
          },
          {
            name: "maintLog",
            type: "text",
            description: "Maintenance log status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Pending",
              "Review",
              "Updated"
            ]
          },
          {
            name: "incident_stat",
            type: "text",
            description: "Incident status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Closed",
              "Open"
            ]
          },
          {
            name: "drill_stat",
            type: "text",
            description: "Emergency drill status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Current",
              "Due",
              "Overdue"
            ]
          },
          {
            name: "train_stat",
            type: "text",
            description: "Staff training status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Current",
              "Due",
              "Overdue"
            ]
          },
          {
            name: "budget_alloc",
            type: "text",
            description: "Budget allocation",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Adequate",
              "Insufficient",
              "Review Required"
            ]
          },
          {
            name: "budget_stat",
            type: "text",
            description: "Budget status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Available",
              "Depleted",
              "Limited"
            ]
          },
          {
            name: "conserveFreq",
            type: "text",
            description: "Conservation frequency",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Frequent",
              "Occasional",
              "Rare"
            ]
          },
          {
            name: "history",
            type: "text",
            description: "Treatment history",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Extensive",
              "Minimal",
              "Moderate"
            ]
          },
          {
            name: "prevTreat",
            type: "bigint",
            description: "Number / reference of previous treatments",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 4
          },
          {
            name: "treatEffect",
            type: "text",
            description: "Treatment effectiveness",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "High",
              "Low",
              "Medium"
            ]
          },
          {
            name: "reversePot",
            type: "text",
            description: "Potential for reversing deterioration",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "High",
              "Low",
              "Medium"
            ]
          }
        ],
        sample_rows: [
          {
            maint_id: 1,
            monitor_link: "MM191823",
            surf_link: 1,
            treat_stat: "In Progress",
            prio_tag: "High",
            lastClean: "2024-12-16",
            nextClean: "2025-05-10",
            cleanDays: 83,
            maintLog: "Updated",
            incident_stat: "Closed",
            drill_stat: "Current",
            train_stat: "Current",
            budget_alloc: "Review Required",
            budget_stat: "Limited",
            conserveFreq: "Rare",
            history: "Extensive",
            prevTreat: 4,
            treatEffect: "Low",
            reversePot: "Medium"
          },
          {
            maint_id: 2,
            monitor_link: "MM153427",
            surf_link: 2,
            treat_stat: null,
            prio_tag: "Medium",
            lastClean: "2024-12-13",
            nextClean: "2025-03-26",
            cleanDays: null,
            maintLog: "Updated",
            incident_stat: null,
            drill_stat: "Overdue",
            train_stat: "Overdue",
            budget_alloc: "Review Required",
            budget_stat: "Depleted",
            conserveFreq: "Rare",
            history: "Minimal",
            prevTreat: 1,
            treatEffect: "Low",
            reversePot: "High"
          },
          {
            maint_id: 3,
            monitor_link: "MM675303",
            surf_link: 3,
            treat_stat: "Not Required",
            prio_tag: "Low",
            lastClean: "2024-11-21",
            nextClean: "2025-05-14",
            cleanDays: 85,
            maintLog: "Pending",
            incident_stat: "Closed",
            drill_stat: "Overdue",
            train_stat: "Overdue",
            budget_alloc: "Insufficient",
            budget_stat: "Limited",
            conserveFreq: "Rare",
            history: "Moderate",
            prevTreat: 8,
            treatEffect: "Low",
            reversePot: "Low"
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "monitor_link",
            references: {
              table: "EnvironmentalReadingsCore",
              column: "monitor_code"
            }
          },
          {
            column: "surf_link",
            references: {
              table: "SurfaceAndPhysicalReadings",
              column: "surf_id"
            }
          }
        ]
      },
      {
        name: "UsageRecords",
        role: "event log",
        description: "How exhibits are used: display rotation, display / storage / handling / transport / packing requirements, access, loan and monitoring frequencies, certification, compliance, audit and quality status.",
        primary_key: [
          "usage_id"
        ],
        columns: [
          {
            name: "usage_id",
            type: "bigint",
            description: "Unique usage record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "env_link",
            type: "text",
            description: "Related environmental reading",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "EnvironmentalReadingsCore",
              column: "monitor_code"
            },
            example: "MM191823"
          },
          {
            name: "rotate_sched",
            type: "text",
            description: "Rotation schedule",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Active",
              "Permanent",
              "Resting"
            ]
          },
          {
            name: "displayMonths",
            type: "bigint",
            description: "Months on display",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 1
          },
          {
            name: "restMonths",
            type: "bigint",
            description: "Months in rest / storage",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 22
          },
          {
            name: "dispReqs",
            type: "text",
            description: "Display requirements",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Custom",
              "Special",
              "Standard"
            ]
          },
          {
            name: "storeReqs",
            type: "text",
            description: "Storage requirements",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Custom",
              "Special",
              "Standard"
            ]
          },
          {
            name: "handleReqs",
            type: "text",
            description: "Handling requirements",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Custom",
              "Special",
              "Standard"
            ]
          },
          {
            name: "transportReqs",
            type: "text",
            description: "Transport requirements",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Custom",
              "Special",
              "Standard"
            ]
          },
          {
            name: "packReqs",
            type: "text",
            description: "Packing requirements",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Custom",
              "Special",
              "Standard"
            ]
          },
          {
            name: "resAccess",
            type: "text",
            description: "Research access frequency",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Frequent",
              "Occasional",
              "Rare"
            ]
          },
          {
            name: "publicDisp",
            type: "text",
            description: "Public display frequency",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Frequent",
              "Occasional",
              "Rare"
            ]
          },
          {
            name: "loanFreq",
            type: "text",
            description: "Loan frequency",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Frequent",
              "Occasional",
              "Rare"
            ]
          },
          {
            name: "handleFreq",
            type: "text",
            description: "Handling frequency",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Frequent",
              "Occasional",
              "Rare"
            ]
          },
          {
            name: "docuFreq",
            type: "text",
            description: "Documentation update frequency",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Frequent",
              "Occasional",
              "Rare"
            ]
          },
          {
            name: "monitorFreq",
            type: "text",
            description: "Monitoring frequency",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Daily",
              "Monthly",
              "Weekly"
            ]
          },
          {
            name: "assessFreq",
            type: "text",
            description: "Condition assessment frequency",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Annually",
              "Monthly",
              "Quarterly"
            ]
          },
          {
            name: "conserveFreq",
            type: "text",
            description: "Conservation treatment frequency",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Frequent",
              "Occasional",
              "Rare"
            ]
          },
          {
            name: "maintFreq",
            type: "text",
            description: "Maintenance frequency",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Monthly",
              "Quarterly",
              "Weekly"
            ]
          },
          {
            name: "inspectFreq",
            type: "text",
            description: "Inspection frequency",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Daily",
              "Monthly",
              "Weekly"
            ]
          },
          {
            name: "calibFreq",
            type: "text",
            description: "Monitoring equipment calibration frequency",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Annually",
              "Monthly",
              "Quarterly"
            ]
          },
          {
            name: "certStatus",
            type: "text",
            description: "Certification status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Current",
              "Expired",
              "Pending"
            ]
          },
          {
            name: "complianceStatus",
            type: "text",
            description: "Compliance status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Compliant",
              "Non-compliant",
              "Partial"
            ]
          },
          {
            name: "auditStatus",
            type: "text",
            description: "Audit status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Failed",
              "Passed",
              "Pending"
            ]
          },
          {
            name: "qualityStatus",
            type: "text",
            description: "Quality status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Failed",
              "Passed",
              "Review"
            ]
          }
        ],
        sample_rows: [
          {
            usage_id: 1,
            env_link: "MM191823",
            rotate_sched: "Permanent",
            displayMonths: 1,
            restMonths: 22,
            dispReqs: "Special",
            storeReqs: "Standard",
            handleReqs: "Custom",
            transportReqs: "Custom",
            packReqs: null,
            resAccess: "Frequent",
            publicDisp: "Frequent",
            loanFreq: "Occasional",
            handleFreq: "Rare",
            docuFreq: "Frequent",
            monitorFreq: "Monthly",
            assessFreq: "Monthly",
            conserveFreq: "Rare",
            maintFreq: "Monthly",
            inspectFreq: "Weekly",
            calibFreq: "Monthly",
            certStatus: "Expired",
            complianceStatus: "Non-compliant",
            auditStatus: "Passed",
            qualityStatus: "Failed"
          },
          {
            usage_id: 2,
            env_link: "MM153427",
            rotate_sched: "Resting",
            displayMonths: 5,
            restMonths: 11,
            dispReqs: "Standard",
            storeReqs: "Custom",
            handleReqs: "Special",
            transportReqs: "Special",
            packReqs: "Special",
            resAccess: "Rare",
            publicDisp: "Frequent",
            loanFreq: null,
            handleFreq: "Rare",
            docuFreq: "Rare",
            monitorFreq: null,
            assessFreq: "Quarterly",
            conserveFreq: "Rare",
            maintFreq: "Weekly",
            inspectFreq: "Monthly",
            calibFreq: "Quarterly",
            certStatus: "Current",
            complianceStatus: "Partial",
            auditStatus: "Pending",
            qualityStatus: "Failed"
          },
          {
            usage_id: 3,
            env_link: "MM675303",
            rotate_sched: "Permanent",
            displayMonths: 6,
            restMonths: 10,
            dispReqs: "Custom",
            storeReqs: "Custom",
            handleReqs: "Standard",
            transportReqs: "Standard",
            packReqs: "Special",
            resAccess: "Rare",
            publicDisp: "Occasional",
            loanFreq: "Occasional",
            handleFreq: "Rare",
            docuFreq: "Frequent",
            monitorFreq: "Weekly",
            assessFreq: "Quarterly",
            conserveFreq: "Rare",
            maintFreq: "Weekly",
            inspectFreq: "Daily",
            calibFreq: "Monthly",
            certStatus: null,
            complianceStatus: "Non-compliant",
            auditStatus: "Failed",
            qualityStatus: "Passed"
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "env_link",
            references: {
              table: "EnvironmentalReadingsCore",
              column: "monitor_code"
            }
          }
        ]
      },
      {
        name: "ArtifactSecurityAccess",
        role: "standalone reference",
        description: "Security, insurance, access and documentation status keyed by loan status. Declares no foreign keys, so it is not directly joinable to artifacts.",
        primary_key: [
          "loan_stat"
        ],
        columns: [
          {
            name: "loan_stat",
            type: "text",
            description: "Loan status (primary key)",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            possible_values: [
              "Available",
              "Not Available",
              "On Loan"
            ]
          },
          {
            name: "insUSD",
            type: "real",
            description: "Insurance value in USD",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: 968368
          },
          {
            name: "SEC_LEVEL",
            type: "text",
            description: "Security level",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Level 1",
              "Level 2",
              "Level 3"
            ]
          },
          {
            name: "access_restrict",
            type: "text",
            description: "Access restriction",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Limited",
              "Public",
              "Restricted"
            ]
          },
          {
            name: "docu_stat",
            type: "text",
            description: "Documentation status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Complete",
              "Partial",
              "Updating"
            ]
          },
          {
            name: "photo_docu",
            type: "text",
            description: "Photo documentation status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Outdated",
              "Recent",
              "Required"
            ]
          },
          {
            name: "cond_report",
            type: "text",
            description: "Condition report status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Current",
              "Due",
              "Overdue"
            ]
          },
          {
            name: "conserve_rec",
            type: "text",
            description: "Conservation record status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Pending",
              "Review Required",
              "Updated"
            ]
          },
          {
            name: "research_access",
            type: "text",
            description: "Research access status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Available",
              "Limited",
              "Restricted"
            ]
          },
          {
            name: "digital_rec",
            type: "text",
            description: "Digital record status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Complete",
              "In Progress",
              "Partial"
            ]
          }
        ],
        sample_rows: [
          {
            loan_stat: "On Loan",
            insUSD: 968368,
            SEC_LEVEL: "Level 3",
            access_restrict: "Public",
            docu_stat: "Updating",
            photo_docu: "Outdated",
            cond_report: "Current",
            conserve_rec: "Review Required",
            research_access: "Limited",
            digital_rec: "In Progress"
          },
          {
            loan_stat: "Available",
            insUSD: 36135,
            SEC_LEVEL: "Level 3",
            access_restrict: "Public",
            docu_stat: "Partial",
            photo_docu: "Required",
            cond_report: "Due",
            conserve_rec: "Pending",
            research_access: "Limited",
            digital_rec: "Partial"
          },
          {
            loan_stat: "Not Available",
            insUSD: 776900,
            SEC_LEVEL: "Level 3",
            access_restrict: "Limited",
            docu_stat: "Updating",
            photo_docu: null,
            cond_report: "Current",
            conserve_rec: "Updated",
            research_access: "Available",
            digital_rec: "Complete"
          }
        ],
        row_count: null,
        foreign_keys: []
      },
      {
        name: "Monitor_Showcase_Map",
        role: "junction",
        description: "Maps environmental monitors to showcases. Declares no foreign keys, but logically links EnvironmentalReadingsCore.monitor_code to Showcases.caseID.",
        primary_key: [
          "mon_ID",
          "case_ID"
        ],
        columns: [
          {
            name: "mon_ID",
            type: "text",
            description: "Monitor identifier",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: "MM191823"
          },
          {
            name: "case_ID",
            type: "text",
            description: "Showcase identifier",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: "SC9857"
          }
        ],
        sample_rows: [
          {
            mon_ID: "MM191823",
            case_ID: "SC9857"
          },
          {
            mon_ID: "MM153427",
            case_ID: "SC7393"
          },
          {
            mon_ID: "MM675303",
            case_ID: "SC9391"
          }
        ],
        row_count: null,
        foreign_keys: []
      }
    ],
    relationships: [
      {
        from: "ArtifactRatings.ART_link",
        to: "ArtifactsCore.ARTregID",
        type: "many-to-one",
        meaning: "Each ArtifactRatings row references one ArtifactsCore row"
      },
      {
        from: "SensitivityData.ART_link",
        to: "ArtifactsCore.ARTregID",
        type: "many-to-one",
        meaning: "Each SensitivityData row references one ArtifactsCore row"
      },
      {
        from: "Showcases.hall_ref",
        to: "ExhibitionHalls.Hall_ID",
        type: "many-to-one",
        meaning: "Each Showcases row references one ExhibitionHalls row"
      },
      {
        from: "EnvironmentalReadingsCore.case_link",
        to: "Showcases.caseID",
        type: "many-to-one",
        meaning: "Each EnvironmentalReadingsCore row references one Showcases row"
      },
      {
        from: "AirQualityReadings.env_link",
        to: "EnvironmentalReadingsCore.monitor_code",
        type: "many-to-one",
        meaning: "Each AirQualityReadings row references one EnvironmentalReadingsCore row"
      },
      {
        from: "SurfaceAndPhysicalReadings.env_link",
        to: "EnvironmentalReadingsCore.monitor_code",
        type: "many-to-one",
        meaning: "Each SurfaceAndPhysicalReadings row references one EnvironmentalReadingsCore row"
      },
      {
        from: "LightAndRadiationReadings.env_link",
        to: "EnvironmentalReadingsCore.monitor_code",
        type: "many-to-one",
        meaning: "Each LightAndRadiationReadings row references one EnvironmentalReadingsCore row"
      },
      {
        from: "ConditionAssessments.art_exam",
        to: "ArtifactsCore.ARTregID",
        type: "many-to-one",
        meaning: "Each ConditionAssessments row references one ArtifactsCore row"
      },
      {
        from: "ConditionAssessments.case_exam",
        to: "Showcases.caseID",
        type: "many-to-one",
        meaning: "Each ConditionAssessments row references one Showcases row"
      },
      {
        from: "ConditionAssessments.light_link",
        to: "LightAndRadiationReadings.rad_id",
        type: "many-to-one",
        meaning: "Each ConditionAssessments row references one LightAndRadiationReadings row"
      },
      {
        from: "RiskAssessments.art_concern",
        to: "ArtifactsCore.ARTregID",
        type: "many-to-one",
        meaning: "Each RiskAssessments row references one ArtifactsCore row"
      },
      {
        from: "RiskAssessments.hall_concern",
        to: "ExhibitionHalls.Hall_ID",
        type: "many-to-one",
        meaning: "Each RiskAssessments row references one ExhibitionHalls row"
      },
      {
        from: "ConservationAndMaintenance.monitor_link",
        to: "EnvironmentalReadingsCore.monitor_code",
        type: "many-to-one",
        meaning: "Each ConservationAndMaintenance row references one EnvironmentalReadingsCore row"
      },
      {
        from: "ConservationAndMaintenance.surf_link",
        to: "SurfaceAndPhysicalReadings.surf_id",
        type: "many-to-one",
        meaning: "Each ConservationAndMaintenance row references one SurfaceAndPhysicalReadings row"
      },
      {
        from: "UsageRecords.env_link",
        to: "EnvironmentalReadingsCore.monitor_code",
        type: "many-to-one",
        meaning: "Each UsageRecords row references one EnvironmentalReadingsCore row"
      }
    ]
  },
  {
    id: "archeology_scan",
    name: "Archaeological 3D Scanning",
    domain: "Archaeology / 3D site documentation and heritage conservation",
    description: "Data from 3D scanning campaigns at archaeological sites. Projects, operators, sites and scanning equipment are linked to scan sessions, environmental conditions, point clouds, meshes, spatial measurements, feature analysis, registration accuracy, data processing, quality control and conservation assessments.",
    engine: "PostgreSQL",
    source: {
      benchmark: "BIRD-Interact (full)",
      dataset_url: "https://huggingface.co/datasets/birdsql/bird-interact-full",
      folder: "archeology_scan",
      paper: "https://arxiv.org/abs/2510.05318",
      license: "CC BY-SA 4.0",
      attribution: "BIRD Team & Google Cloud"
    },
    what_you_can_ask: [
      "Scan quality, resolution and coverage",
      "Site preservation, risk and conservation priority",
      "Equipment performance, cost and battery status",
      "Mesh and texture fidelity",
      "Registration accuracy and error",
      "Processing efficiency and resource usage",
      "Environmental conditions during scanning",
      "Project funding, permits and publication status"
    ],
    stats: {
      table_count: 14,
      jsonb_column_count: 10,
      row_counts_note: "Row counts are null because the dump is not hosted on Hugging Face; fill after loading it."
    },
    tables: [
      {
        name: "projects",
        role: "core entity",
        description: "Archaeological scanning projects with funding source and excavation permit details.",
        primary_key: [
          "arcregistry"
        ],
        columns: [
          {
            name: "arcregistry",
            type: "text",
            description: "Unique project identifier",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: "PR7509"
          },
          {
            name: "vesseltag",
            type: "text",
            description: "Project name or label",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Project Happy"
          },
          {
            name: "fundflux",
            type: "text",
            description: "Funding source",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Government",
              "Grant",
              "Private",
              "University"
            ]
          },
          {
            name: "authpin",
            type: "text",
            description: "Excavation permit number",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "PMT4719"
          },
          {
            name: "authhalt",
            type: "text",
            description: "Permit expiry date, stored as text (dd/mm/yyyy)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "05/12/2025"
          }
        ],
        sample_rows: [
          {
            arcregistry: "PR7509",
            vesseltag: "Project Happy",
            fundflux: "Government",
            authpin: "PMT4719",
            authhalt: "05/12/2025"
          },
          {
            arcregistry: "PR8078",
            vesseltag: "Project Off",
            fundflux: "Government",
            authpin: "PMT4944",
            authhalt: "20/09/2025"
          },
          {
            arcregistry: "PR9973",
            vesseltag: "Project Central",
            fundflux: "University",
            authpin: "PMT5400",
            authhalt: "18/03/2025"
          }
        ],
        row_count: null,
        foreign_keys: []
      },
      {
        name: "personnel",
        role: "reference / lookup",
        description: "Scan operators and the supervisors they report to.",
        primary_key: [
          "crewregistry"
        ],
        columns: [
          {
            name: "crewregistry",
            type: "text",
            description: "Operator identifier",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: "OP4641"
          },
          {
            name: "crewlabel",
            type: "text",
            description: "Operator name",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Joel Wallace"
          },
          {
            name: "leadregistry",
            type: "text",
            description: "Supervisor identifier",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "SV7658"
          },
          {
            name: "leadlabel",
            type: "text",
            description: "Supervisor name",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Michael Kaiser"
          }
        ],
        sample_rows: [
          {
            crewregistry: "OP4641",
            crewlabel: "Joel Wallace",
            leadregistry: "SV7658",
            leadlabel: "Michael Kaiser"
          },
          {
            crewregistry: "OP8435",
            crewlabel: "Latoya Abbott",
            leadregistry: "SV2189",
            leadlabel: "Stephanie Marquez"
          },
          {
            crewregistry: "OP7199",
            crewlabel: "Aaron Knight",
            leadregistry: "SV6920",
            leadlabel: "Victoria George"
          }
        ],
        row_count: null,
        foreign_keys: []
      },
      {
        name: "sites",
        role: "core entity",
        description: "Excavation sites with cultural period, estimated date, type, weather protection, geographic position and condition / security assessment (JSONB).",
        primary_key: [
          "zoneregistry"
        ],
        columns: [
          {
            name: "zoneregistry",
            type: "text",
            description: "Unique site code",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: "SC9016"
          },
          {
            name: "zonelabel",
            type: "text",
            description: "Site name",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Site-North Alexanderville"
          },
          {
            name: "digunit",
            type: "text",
            description: "Excavation unit within the site",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Unit-C9"
          },
          {
            name: "gridtrace",
            type: "text",
            description: "Grid reference",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "S29-E8"
          },
          {
            name: "phasefactor",
            type: "text",
            description: "Cultural period. Null = undetermined.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Iron Age"
          },
          {
            name: "guessdate",
            type: "text",
            description: "Estimated date, stored as text",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "-2929 BCE"
          },
          {
            name: "typesite",
            type: "text",
            description: "Site type. Null = pending or undetermined.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Burial"
          },
          {
            name: "guardhint",
            type: "text",
            description: "Weather protection at site. Null = not assessed.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Permanent",
              "Temporary"
            ]
          },
          {
            name: "geo_position",
            type: "jsonb",
            description: "Coordinates, elevation and dig depth (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              root: {
                description: "Geographic position",
                fields: [
                  {
                    name: "Geo_X",
                    type: "REAL",
                    description: "Latitude (decimal degrees)",
                    example: -9.602135
                  },
                  {
                    name: "Geo_Y",
                    type: "REAL",
                    description: "Longitude (decimal degrees)",
                    example: -2.756411
                  },
                  {
                    name: "Height_M",
                    type: "REAL",
                    description: "Altitude above sea level (m)",
                    example: 4391.4
                  },
                  {
                    name: "Depth_C",
                    type: "REAL",
                    description: "Excavation depth below surface (cm)",
                    example: 329.9
                  }
                ]
              }
            }
          },
          {
            name: "site_status",
            type: "jsonb",
            description: "Preservation, access, safety and risk status (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              root: {
                description: "Site condition and security",
                fields: [
                  {
                    name: "Pres_Stat",
                    type: "TEXT",
                    description: "Preservation status",
                    possible_values: [
                      "Critical",
                      "Excellent",
                      "Fair",
                      "Good",
                      "Poor"
                    ]
                  },
                  {
                    name: "Entry_Stat",
                    type: "TEXT",
                    description: "Site accessibility",
                    possible_values: [
                      "Closed",
                      "Open",
                      "Restricted"
                    ]
                  },
                  {
                    name: "Safe_Rank",
                    type: "TEXT",
                    description: "Security level. Null = not assessed.",
                    example: "Minimal"
                  },
                  {
                    name: "Insur_Stat",
                    type: "TEXT",
                    description: "Insurance coverage",
                    possible_values: [
                      "Active",
                      "Expired",
                      "Pending"
                    ]
                  },
                  {
                    name: "Risk_Eval",
                    type: "TEXT",
                    description: "Risk assessment status. Null = not conducted.",
                    example: "Pending"
                  },
                  {
                    name: "Health_Eval",
                    type: "TEXT",
                    description: "Health and safety evaluation",
                    possible_values: [
                      "Approved",
                      "Pending",
                      "Review"
                    ]
                  },
                  {
                    name: "Env_Haz",
                    type: "TEXT",
                    description: "Environmental hazard level",
                    possible_values: [
                      "High",
                      "Low",
                      "Medium"
                    ]
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            zoneregistry: "SC9016",
            zonelabel: "Site-North Alexanderville",
            digunit: "Unit-C9",
            gridtrace: "S29-E8",
            phasefactor: "Iron Age",
            guessdate: "-2929 BCE",
            typesite: "Bur.",
            guardhint: null,
            geo_position: {
              Geo_X: -9.602135,
              Geo_Y: -2.756411,
              Depth_C: 329.9,
              Height_M: 4391.4
            },
            site_status: {
              Env_Haz: "Low",
              Pres_Stat: "Excellent",
              Risk_Eval: "Req.",
              Safe_Rank: "Minimal",
              Entry_Stat: "Closed",
              Insur_Stat: "Expired",
              Health_Eval: "Approved"
            }
          },
          {
            zoneregistry: "SC9081",
            zonelabel: "Site-Grahammouth",
            digunit: "Unit-A14",
            gridtrace: "N44-W27",
            phasefactor: "Middle Ages",
            guessdate: "1335 BCE",
            typesite: "Industrial",
            guardhint: "Temporary",
            geo_position: {
              Geo_X: 57.10752,
              Geo_Y: 70.03605,
              Depth_C: 97.5,
              Height_M: 429.28
            },
            site_status: {
              Env_Haz: "Low",
              Pres_Stat: "Fair",
              Risk_Eval: "Pending",
              Safe_Rank: "Standard",
              Entry_Stat: "Restricted",
              Insur_Stat: "Pending",
              Health_Eval: "Pending"
            }
          },
          {
            zoneregistry: "SC4817",
            zonelabel: "Site-Port Brianside",
            digunit: "Unit-D19",
            gridtrace: "S48-W26",
            phasefactor: "IRON AGE",
            guessdate: "-4985 BCE",
            typesite: "Burial",
            guardhint: null,
            geo_position: {
              Geo_X: 73.605545,
              Geo_Y: 141.71112,
              Depth_C: 499.9,
              Height_M: 4934.58
            },
            site_status: {
              Env_Haz: "High",
              Pres_Stat: "Critical",
              Risk_Eval: "Completed",
              Safe_Rank: "High",
              Entry_Stat: "Closed",
              Insur_Stat: "Expired",
              Health_Eval: "Review"
            }
          }
        ],
        row_count: null,
        foreign_keys: []
      },
      {
        name: "equipment",
        role: "reference / lookup",
        description: "3D scanning equipment (LiDAR, structured light, photogrammetry) with calibration date, status, battery and performance rates. Many measures are stored as text with units.",
        primary_key: [
          "equipregistry"
        ],
        columns: [
          {
            name: "equipregistry",
            type: "text",
            description: "Equipment serial number",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: "SN20065"
          },
          {
            name: "equipform",
            type: "text",
            description: "Equipment type",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "LiDAR scanner, precise 3D measurement technology"
          },
          {
            name: "equipdesign",
            type: "text",
            description: "Model designation",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Model-669"
          },
          {
            name: "equiptune",
            type: "date",
            description: "Date of last calibration or maintenance",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "2024-11-01"
          },
          {
            name: "equipstatus",
            type: "text",
            description: "Operational condition",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Excellent condition, optimal performance guaranteed"
          },
          {
            name: "powerlevel",
            type: "text",
            description: "Battery charge description",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "62% battery, extended operation available"
          },
          {
            name: "transport_speed",
            type: "text",
            description: "Transport speed",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "82 km/h"
          },
          {
            name: "coverage_rate",
            type: "text",
            description: "Area coverage rate",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "15 m²/hr"
          },
          {
            name: "point_generation_rate",
            type: "text",
            description: "Point cloud generation rate",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "62000 pts/min"
          },
          {
            name: "cost_per_area",
            type: "text",
            description: "Cost per unit area",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "58 USD/m²"
          },
          {
            name: "accuracy_per_time",
            type: "text",
            description: "Accuracy over scanning time",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "8 mm/hr"
          },
          {
            name: "power_consumption",
            type: "text",
            description: "Power consumption rate",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "124 W/hr"
          },
          {
            name: "battery_drain",
            type: "text",
            description: "Battery consumption rate",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "13%/hr"
          },
          {
            name: "storage_usage_rate",
            type: "text",
            description: "Storage consumption rate",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "6 GB/hr"
          }
        ],
        sample_rows: [
          {
            equipregistry: "SN20065",
            equipform: "LiDAR scanner, precise 3D measurement technology",
            equipdesign: "Model-669",
            equiptune: "2024-11-01",
            equipstatus: "Excellent condition, optimal performance guaranteed",
            powerlevel: "62% battery, extended operation available",
            transport_speed: "82 km/h",
            coverage_rate: "15 m²/hr",
            point_generation_rate: "62000 pts/min",
            cost_per_area: "58 USD/m²",
            accuracy_per_time: "8 mm/hr",
            power_consumption: "124 W/hr",
            battery_drain: "13%/hr",
            storage_usage_rate: "6 GB/hr"
          },
          {
            equipregistry: "SN29799",
            equipform: "Structured light scanner, high-resolution surface capture",
            equipdesign: "Model-835",
            equiptune: "2024-09-09",
            equipstatus: "Good condition, reliable operation expected",
            powerlevel: "21% battery, limited operation time",
            transport_speed: "41 km/h",
            coverage_rate: "5 m²/hr",
            point_generation_rate: "21000 pts/min",
            cost_per_area: "99 USD/m²",
            accuracy_per_time: "3 mm/hr",
            power_consumption: "42 W/hr",
            battery_drain: "21%/hr",
            storage_usage_rate: "2 GB/hr"
          },
          {
            equipregistry: "SN83019",
            equipform: "Photogrammetry system, image-based 3D reconstruction",
            equipdesign: "Model-566",
            equiptune: "2025-02-08",
            equipstatus: "Good condition, reliable operation expected",
            powerlevel: "46% battery, moderate operation time",
            transport_speed: "66 km/h",
            coverage_rate: "11 m²/hr",
            point_generation_rate: "46000 pts/min",
            cost_per_area: "74 USD/m²",
            accuracy_per_time: "6 mm/hr",
            power_consumption: "92 W/hr",
            battery_drain: "16%/hr",
            storage_usage_rate: "4 GB/hr"
          }
        ],
        row_count: null,
        foreign_keys: []
      },
      {
        name: "scans",
        role: "event log",
        description: "Individual scan sessions: when, by whom, at which site and project, weather, colour mode, file format, data size and cost.",
        primary_key: [
          "questregistry"
        ],
        columns: [
          {
            name: "questregistry",
            type: "text",
            description: "Unique scan session identifier",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: "ASD409481"
          },
          {
            name: "chronotag",
            type: "text",
            description: "Timestamp of the scan, stored as text with timezone",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "2024-09-03 07:20:28.479288 GMT+8"
          },
          {
            name: "arcref",
            type: "text",
            description: "Project",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "projects",
              column: "arcregistry"
            },
            example: "PR7509"
          },
          {
            name: "crewref",
            type: "text",
            description: "Operator who scanned",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "personnel",
              column: "crewregistry"
            },
            example: "OP4641"
          },
          {
            name: "zoneref",
            type: "text",
            description: "Site scanned",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "sites",
              column: "zoneregistry"
            },
            example: "SC9016"
          },
          {
            name: "scancount",
            type: "text",
            description: "Number of scans in the session, with description",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "5 scans, moderate coverage session"
          },
          {
            name: "climtune",
            type: "text",
            description: "Weather conditions. Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Windy conditions, potential equipment stability issues"
          },
          {
            name: "huecatch",
            type: "text",
            description: "Colour capture mode. Null = not recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Grayscale",
              "RGB"
            ]
          },
          {
            name: "fmtfile",
            type: "text",
            description: "File format",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "PTS"
          },
          {
            name: "size",
            type: "text",
            description: "Scan data size, stored as text with unit",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "24.71 GB"
          },
          {
            name: "scan_cost",
            type: "text",
            description: "Cost per GB",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "3.22 USD/GB"
          },
          {
            name: "scanning_rate",
            type: "text",
            description: "Data acquisition rate",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "63 MB/min"
          }
        ],
        sample_rows: [
          {
            questregistry: "ASD409481",
            chronotag: "2024-09-03 07:20:28.479288 GMT+8",
            arcref: "PR7509",
            crewref: "OP4641",
            zoneref: "SC9016",
            scancount: "5 scans, moderate coverage session",
            climtune: "Windy conditions, potential equipment stability issues",
            huecatch: "RGB",
            fmtfile: "PTS",
            size: "24.71 GB",
            scan_cost: "3.22 USD/GB",
            scanning_rate: "63 MB/min"
          },
          {
            questregistry: "ASD648638",
            chronotag: "2024-07-27 08:52:12.479479 GMT+8",
            arcref: "PR8078",
            crewref: "OP8435",
            zoneref: "SC9081",
            scancount: "2 scans, moderate coverage session",
            climtune: "Rainy weather, equipment protection required",
            huecatch: "RGB",
            fmtfile: "PLY",
            size: "21.63 GB",
            scan_cost: "6.86 USD/GB",
            scanning_rate: "240 MB/min"
          },
          {
            questregistry: "ASD535327",
            chronotag: "2025-01-24 12:45:10.479479 GMT+8",
            arcref: "PR9973",
            crewref: "OP7199",
            zoneref: "SC4817",
            scancount: "7 scans, comprehensive coverage session",
            climtune: "Windy conditions, potential equipment stability issues",
            huecatch: "RGB",
            fmtfile: "PLY",
            size: "41.48 GB",
            scan_cost: "4.2 USD/GB",
            scanning_rate: "37 MB/min"
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "arcref",
            references: {
              table: "projects",
              column: "arcregistry"
            }
          },
          {
            column: "crewref",
            references: {
              table: "personnel",
              column: "crewregistry"
            }
          },
          {
            column: "zoneref",
            references: {
              table: "sites",
              column: "zoneregistry"
            }
          }
        ]
      },
      {
        name: "environment",
        role: "snapshot detail",
        description: "Environmental conditions during scanning at a site with a given piece of equipment: photogrammetry overlap, images per minute, and ambient temperature, humidity, light and connectivity (JSONB).",
        primary_key: [
          "airregistry"
        ],
        columns: [
          {
            name: "airregistry",
            type: "bigint",
            description: "Unique environmental record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "zoneref",
            type: "text",
            description: "Site",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "sites",
              column: "zoneregistry"
            },
            example: "SC9016"
          },
          {
            name: "equipref",
            type: "text",
            description: "Equipment used",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "equipment",
              column: "equipregistry"
            },
            example: "SN20065"
          },
          {
            name: "photomap",
            type: "text",
            description: "Photogrammetry overlap setting",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "60%",
              "70%",
              "80%",
              "90%"
            ]
          },
          {
            name: "imgcount",
            type: "text",
            description: "Images captured per minute, stored as text",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "248 imgs/mins"
          },
          {
            name: "ambient_cond",
            type: "jsonb",
            description: "Ambient scanning conditions (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              root: {
                description: "Ambient conditions",
                fields: [
                  {
                    name: "Ambic_Temp",
                    type: "REAL",
                    description: "Ambient temperature (°C)",
                    example: 25.3
                  },
                  {
                    name: "Hume_Pct",
                    type: "REAL",
                    description: "Relative humidity (%)",
                    example: 60.4
                  },
                  {
                    name: "Illume_Lux",
                    type: "BIGINT",
                    description: "Light intensity (lux)",
                    example: 86054
                  },
                  {
                    name: "Geo_Signal",
                    type: "TEXT",
                    description: "GPS signal quality. Null = not monitored.",
                    possible_values: [
                      "Excellent",
                      "Good",
                      "Poor"
                    ]
                  },
                  {
                    name: "Track_Status",
                    type: "TEXT",
                    description: "RTK positioning status. Null = not operational.",
                    possible_values: [
                      "Fixed",
                      "Float"
                    ]
                  },
                  {
                    name: "Link_Status",
                    type: "TEXT",
                    description: "Network connectivity",
                    possible_values: [
                      "Connected",
                      "Disconnected",
                      "Limited"
                    ]
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            airregistry: 523,
            zoneref: "SC1896",
            equipref: "SN93781",
            photomap: "60%",
            imgcount: "241 imgs/mins",
            ambient_cond: {
              Hume_Pct: 52.3,
              Ambic_Temp: 22.3,
              Geo_Signal: "Good",
              Illume_Lux: 99474,
              Link_Status: "Limited",
              Track_Status: "Fixed"
            }
          },
          {
            airregistry: 606,
            zoneref: "SC1426",
            equipref: "SN63826",
            photomap: "60%",
            imgcount: "240 imgs/mins",
            ambient_cond: {
              Hume_Pct: 71.2,
              Ambic_Temp: 4.6,
              Geo_Signal: "Poor",
              Illume_Lux: 10046,
              Link_Status: "Connected",
              Track_Status: null
            }
          },
          {
            airregistry: 1,
            zoneref: "SC9016",
            equipref: "SN20065",
            photomap: "80%",
            imgcount: "248 imgs/mins",
            ambient_cond: {
              Hume_Pct: 60.4,
              Ambic_Temp: 25.3,
              Geo_Signal: null,
              Illume_Lux: 86054,
              Link_Status: "Disconnected",
              Track_Status: null
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "zoneref",
            references: {
              table: "sites",
              column: "zoneregistry"
            }
          },
          {
            column: "equipref",
            references: {
              table: "equipment",
              column: "equipregistry"
            }
          }
        ]
      },
      {
        name: "pointcloud",
        role: "snapshot detail",
        description: "Point cloud quality and density metrics per project and operator (JSONB): resolution, density, coverage, overlap, noise and reflectivity.",
        primary_key: [
          "cloudregistry"
        ],
        columns: [
          {
            name: "cloudregistry",
            type: "bigint",
            description: "Unique point cloud record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "crewref",
            type: "text",
            description: "Operator",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "personnel",
              column: "crewregistry"
            },
            example: "OP4641"
          },
          {
            name: "arcref",
            type: "text",
            description: "Project",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "projects",
              column: "arcregistry"
            },
            example: "PR7509"
          },
          {
            name: "cloud_metrics",
            type: "jsonb",
            description: "Point cloud metrics (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              root: {
                description: "Point cloud quality",
                fields: [
                  {
                    name: "Scan_Resol_Mm",
                    type: "REAL",
                    description: "Scan resolution (mm)",
                    example: 2.4
                  },
                  {
                    name: "Point_Dense",
                    type: "BIGINT",
                    description: "Point density (points per m²)",
                    example: 42812
                  },
                  {
                    name: "Cover_Pct",
                    type: "REAL",
                    description: "Surface coverage (%)",
                    example: 91.2
                  },
                  {
                    name: "Total_Pts",
                    type: "BIGINT",
                    description: "Total points",
                    example: 46562436
                  },
                  {
                    name: "Cloud_Dense",
                    type: "BIGINT",
                    description: "Point cloud density code",
                    example: 9449
                  },
                  {
                    name: "Lap_Pct",
                    type: "REAL",
                    description: "Overlap between scan segments (%)",
                    example: 31.3
                  },
                  {
                    name: "Noise_Db",
                    type: "REAL",
                    description: "Noise level (dB)",
                    example: 1.318
                  },
                  {
                    name: "Ref_Pct",
                    type: "REAL",
                    description: "Surface reflectivity (%)",
                    example: 11
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            cloudregistry: 1,
            crewref: "OP4641",
            arcref: "PR7509",
            cloud_metrics: {
              Lap_Pct: 31.3,
              Ref_Pct: 11,
              Noise_Db: 1.318,
              Cover_Pct: 91.2,
              Total_Pts: 46562436,
              Cloud_Dense: 9449,
              Point_Dense: 42812,
              Scan_Resol_Mm: 2.4
            }
          },
          {
            cloudregistry: 2,
            crewref: "OP7199",
            arcref: "PR9973",
            cloud_metrics: {
              Lap_Pct: 31.7,
              Ref_Pct: 53.8,
              Noise_Db: 1.79,
              Cover_Pct: 98.1,
              Total_Pts: 87734478,
              Cloud_Dense: 1746,
              Point_Dense: 934361,
              Scan_Resol_Mm: 4.9
            }
          },
          {
            cloudregistry: 3,
            crewref: "OP5563",
            arcref: "PR8865",
            cloud_metrics: {
              Lap_Pct: 39.9,
              Ref_Pct: 67.4,
              Noise_Db: 1.041,
              Cover_Pct: 88.3,
              Total_Pts: 40047207,
              Cloud_Dense: 7553,
              Point_Dense: 411433,
              Scan_Resol_Mm: 1.41
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "crewref",
            references: {
              table: "personnel",
              column: "crewregistry"
            }
          },
          {
            column: "arcref",
            references: {
              table: "projects",
              column: "arcregistry"
            }
          }
        ]
      },
      {
        name: "mesh",
        role: "snapshot detail",
        description: "3D mesh specifications per site and piece of equipment (JSONB): vertices, faces, resolution, texture and geometric accuracy.",
        primary_key: [
          "facetregistry"
        ],
        columns: [
          {
            name: "facetregistry",
            type: "bigint",
            description: "Unique mesh record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "zoneref",
            type: "text",
            description: "Site",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "sites",
              column: "zoneregistry"
            },
            example: "SC9081"
          },
          {
            name: "equipref",
            type: "text",
            description: "Equipment",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "equipment",
              column: "equipregistry"
            },
            example: "SN29799"
          },
          {
            name: "mesh_specs",
            type: "jsonb",
            description: "Mesh specifications (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              root: {
                description: "Mesh geometry and texture",
                fields: [
                  {
                    name: "Facet_Verts",
                    type: "BIGINT",
                    description: "Mesh vertices",
                    example: 7234721
                  },
                  {
                    name: "Facet_Faces",
                    type: "BIGINT",
                    description: "Mesh faces",
                    example: 5997318
                  },
                  {
                    name: "Facet_Res_Mm",
                    type: "REAL",
                    description: "Mesh resolution (mm)",
                    example: 3.2
                  },
                  {
                    name: "Tex_Dist",
                    type: "TEXT",
                    description: "Texture resolution class. Null = not specified.",
                    possible_values: [
                      "1K",
                      "2K",
                      "4K"
                    ]
                  },
                  {
                    name: "Tex_Pix",
                    type: "BIGINT",
                    description: "Texture size in pixels",
                    possible_values: [
                      1024,
                      2048,
                      4096,
                      8192
                    ]
                  },
                  {
                    name: "UV_Map_Qual",
                    type: "TEXT",
                    description: "UV mapping quality",
                    possible_values: [
                      "High",
                      "Low",
                      "Medium"
                    ]
                  },
                  {
                    name: "Geom_Delta_Mm",
                    type: "REAL",
                    description: "Geometric accuracy (mm)",
                    example: 2.74
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            facetregistry: 1,
            zoneref: "SC9081",
            equipref: "SN29799",
            mesh_specs: {
              Tex_Pix: 8192,
              Tex_Dist: "2K",
              Facet_Faces: 7708278,
              Facet_Verts: 2361491,
              UV_Map_Qual: "High",
              Facet_Res_Mm: 9.79,
              Geom_Delta_Mm: 3.79
            }
          },
          {
            facetregistry: 2,
            zoneref: "SC4817",
            equipref: "SN83019",
            mesh_specs: {
              Tex_Pix: 4096,
              Tex_Dist: "1K",
              Facet_Faces: 1973487,
              Facet_Verts: 542100,
              UV_Map_Qual: "Low",
              Facet_Res_Mm: 2.33,
              Geom_Delta_Mm: 0.48
            }
          },
          {
            facetregistry: 3,
            zoneref: "SC4082",
            equipref: "SN60801",
            mesh_specs: {
              Tex_Pix: 4096,
              Tex_Dist: "4K",
              Facet_Faces: 8715696,
              Facet_Verts: 5250157,
              UV_Map_Qual: "Medium",
              Facet_Res_Mm: 3.76,
              Geom_Delta_Mm: 4.27
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "zoneref",
            references: {
              table: "sites",
              column: "zoneregistry"
            }
          },
          {
            column: "equipref",
            references: {
              table: "equipment",
              column: "equipregistry"
            }
          }
        ]
      },
      {
        name: "spatial",
        role: "snapshot detail",
        description: "Spatial measurements per project and operator (JSONB): area, volume, bounding box, orientation angles and ground sampling distance.",
        primary_key: [
          "domainregistry"
        ],
        columns: [
          {
            name: "domainregistry",
            type: "bigint",
            description: "Unique spatial record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "arcref",
            type: "text",
            description: "Project",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "projects",
              column: "arcregistry"
            },
            example: "PR7509"
          },
          {
            name: "crewref",
            type: "text",
            description: "Operator",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "personnel",
              column: "crewregistry"
            },
            example: "OP4641"
          },
          {
            name: "spatial_dims",
            type: "jsonb",
            description: "Spatial dimensions (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              root: {
                description: "Size and sampling",
                fields: [
                  {
                    name: "Area_M2",
                    type: "REAL",
                    description: "Surface area (m²)",
                    example: 78.01
                  },
                  {
                    name: "Vol_M3",
                    type: "REAL",
                    description: "Volume (m³)",
                    example: 76.7
                  },
                  {
                    name: "Ground_Span",
                    type: "REAL",
                    description: "Ground sampling distance (mm)",
                    example: 4.13
                  }
                ]
              },
              Bounding_Box: {
                description: "Bounding box dimensions",
                fields: [
                  {
                    name: "Box_X",
                    type: "REAL",
                    description: "X dimension (m)",
                    example: 40.12
                  },
                  {
                    name: "Box_Y",
                    type: "REAL",
                    description: "Y dimension (m)",
                    example: 1.06
                  },
                  {
                    name: "Box_Z",
                    type: "REAL",
                    description: "Z dimension (m)",
                    example: 8.74
                  }
                ]
              },
              Angles: {
                description: "Orientation",
                fields: [
                  {
                    name: "Angle_Az",
                    type: "REAL",
                    description: "Azimuth angle (degrees)",
                    example: 342.4
                  },
                  {
                    name: "Angle_Tilt",
                    type: "REAL",
                    description: "Tilt angle (degrees)",
                    example: 23.9
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            domainregistry: 1,
            arcref: "PR7509",
            crewref: "OP4641",
            spatial_dims: {
              Angles: {
                Angle_Az: 342.4,
                Angle_Tilt: 23.9
              },
              Vol_M3: 76.7,
              Area_M2: 78.01,
              Ground_Span: 4.13,
              Bounding_Box: {
                Box_X: 40.12,
                Box_Y: 1.06,
                Box_Z: 8.74
              }
            }
          },
          {
            domainregistry: 2,
            arcref: "PR8865",
            crewref: "OP5563",
            spatial_dims: {
              Angles: {
                Angle_Az: 91.3,
                Angle_Tilt: -14.5
              },
              Vol_M3: 49.88,
              Area_M2: 286.85,
              Ground_Span: 9.52,
              Bounding_Box: {
                Box_X: 32.93,
                Box_Y: 5.25,
                Box_Z: 18.09
              }
            }
          },
          {
            domainregistry: 3,
            arcref: "PR5905",
            crewref: "OP2517",
            spatial_dims: {
              Angles: {
                Angle_Az: 147.9,
                Angle_Tilt: 19.6
              },
              Vol_M3: 41.68,
              Area_M2: 993.96,
              Ground_Span: 1.83,
              Bounding_Box: {
                Box_X: 32.52,
                Box_Y: 47.08,
                Box_Z: 16.6
              }
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "arcref",
            references: {
              table: "projects",
              column: "arcregistry"
            }
          },
          {
            column: "crewref",
            references: {
              table: "personnel",
              column: "crewregistry"
            }
          }
        ]
      },
      {
        name: "features",
        role: "snapshot detail",
        description: "Archaeological feature extraction results per site and equipment (JSONB): feature and artifact counts, structure and material classification, and analysis completion status.",
        primary_key: [
          "traitregistry"
        ],
        columns: [
          {
            name: "traitregistry",
            type: "bigint",
            description: "Unique feature record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "zoneref",
            type: "text",
            description: "Site",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "sites",
              column: "zoneregistry"
            },
            example: "SC9016"
          },
          {
            name: "equipref",
            type: "text",
            description: "Equipment",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "equipment",
              column: "equipregistry"
            },
            example: "SN20065"
          },
          {
            name: "traitextract",
            type: "text",
            description: "Feature extraction method",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Automatic",
              "Manual",
              "Semi-automatic"
            ]
          },
          {
            name: "feature_analysis",
            type: "jsonb",
            description: "Feature analysis results (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              root: {
                description: "Counts and classification",
                fields: [
                  {
                    name: "Trait_Count",
                    type: "BIGINT",
                    description: "Features identified",
                    example: 516
                  },
                  {
                    name: "Arti_Count",
                    type: "BIGINT",
                    description: "Artifacts detected",
                    example: 71
                  },
                  {
                    name: "Struct_Kind",
                    type: "TEXT",
                    description: "Structure type",
                    possible_values: [
                      "Artifact",
                      "Complex",
                      "Floor",
                      "Foundation",
                      "Wall"
                    ]
                  },
                  {
                    name: "Mat_Kind",
                    type: "TEXT",
                    description: "Material type",
                    possible_values: [
                      "Ceramic",
                      "Metal",
                      "Mixed",
                      "Organic",
                      "Stone"
                    ]
                  }
                ]
              },
              Analysis_Status: {
                description: "Analysis completion",
                fields: [
                  {
                    name: "Hue_Study",
                    type: "TEXT",
                    description: "Colour analysis status",
                    possible_values: [
                      "Completed",
                      "Not Required",
                      "Partial"
                    ]
                  },
                  {
                    name: "Texture_Study",
                    type: "TEXT",
                    description: "Texture analysis status",
                    possible_values: [
                      "Completed",
                      "Not Required",
                      "Partial"
                    ]
                  },
                  {
                    name: "Pattern_Note",
                    type: "TEXT",
                    description: "Pattern recognition status",
                    possible_values: [
                      "Completed",
                      "Not Required",
                      "Partial"
                    ]
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            traitregistry: 1,
            zoneref: "SC9016",
            equipref: "SN20065",
            traitextract: "Manual",
            feature_analysis: {
              Mat_Kind: "Organic",
              Arti_Count: 71,
              Struct_Kind: "Artifact",
              Trait_Count: 516,
              Analysis_Status: {
                Hue_Study: "Partial",
                Pattern_Note: "Not Required",
                Texture_Study: "Partial"
              }
            }
          },
          {
            traitregistry: 2,
            zoneref: "SC4817",
            equipref: "SN83019",
            traitextract: "Manual",
            feature_analysis: {
              Mat_Kind: "Ceramic",
              Arti_Count: 69,
              Struct_Kind: "Complex",
              Trait_Count: 103,
              Analysis_Status: {
                Hue_Study: "Completed",
                Pattern_Note: "Not Required",
                Texture_Study: "Partial"
              }
            }
          },
          {
            traitregistry: 3,
            zoneref: "SC4082",
            equipref: "SN60801",
            traitextract: "Automatic",
            feature_analysis: {
              Mat_Kind: "Mixed",
              Arti_Count: 8,
              Struct_Kind: "Wall",
              Trait_Count: 820,
              Analysis_Status: {
                Hue_Study: "Not Required",
                Pattern_Note: "Completed",
                Texture_Study: "Completed"
              }
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "zoneref",
            references: {
              table: "sites",
              column: "zoneregistry"
            }
          },
          {
            column: "equipref",
            references: {
              table: "equipment",
              column: "equipregistry"
            }
          }
        ]
      },
      {
        name: "conservation",
        role: "event log",
        description: "Conservation assessments per project and site: damage level, priority, structural state, intervention history and prior documentation.",
        primary_key: [
          "cureregistry"
        ],
        columns: [
          {
            name: "cureregistry",
            type: "bigint",
            description: "Unique conservation record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "arcref",
            type: "text",
            description: "Project",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "projects",
              column: "arcregistry"
            },
            example: "PR7509"
          },
          {
            name: "zoneref",
            type: "text",
            description: "Site",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "sites",
              column: "zoneregistry"
            },
            example: "SC9016"
          },
          {
            name: "harmassess",
            type: "text",
            description: "Damage assessment. Null = not conducted.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Minor",
              "Moderate",
              "Severe"
            ]
          },
          {
            name: "curerank",
            type: "text",
            description: "Conservation priority, stored as descriptive text",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Critical priority, immediate conservation required"
          },
          {
            name: "structstate",
            type: "text",
            description: "Structural stability, stored as descriptive text",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Moderate condition, careful monitoring required"
          },
          {
            name: "intervhistory",
            type: "text",
            description: "Previous conservation interventions. Null = none recorded.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Major",
              "Minor"
            ]
          },
          {
            name: "priordocs",
            type: "text",
            description: "Previous documentation available. Null = none.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Complete",
              "Partial"
            ]
          }
        ],
        sample_rows: [
          {
            cureregistry: 1,
            arcref: "PR7509",
            zoneref: "SC9016",
            harmassess: null,
            curerank: "Critical priority, immediate conservation required",
            structstate: "Moderate condition, careful monitoring required",
            intervhistory: "Minor",
            priordocs: null
          },
          {
            cureregistry: 2,
            arcref: "PR8078",
            zoneref: "SC9081",
            harmassess: "Severe",
            curerank: "Low priority, routine maintenance sufficient",
            structstate: "Moderate condition, careful monitoring required",
            intervhistory: "Major",
            priordocs: "Partial"
          },
          {
            cureregistry: 3,
            arcref: "PR3991",
            zoneref: "SC4460",
            harmassess: "Minor",
            curerank: "High priority, urgent conservation attention needed",
            structstate: "Moderate condition, careful monitoring required",
            intervhistory: "Major",
            priordocs: null
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "arcref",
            references: {
              table: "projects",
              column: "arcregistry"
            }
          },
          {
            column: "zoneref",
            references: {
              table: "sites",
              column: "zoneregistry"
            }
          }
        ]
      },
      {
        name: "registration",
        role: "snapshot detail",
        description: "Scan registration (alignment) accuracy per project and operator (JSONB): accuracy, reference markers, control points, method, transform and error values.",
        primary_key: [
          "logregistry"
        ],
        columns: [
          {
            name: "logregistry",
            type: "bigint",
            description: "Unique registration record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "crewref",
            type: "text",
            description: "Operator",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "personnel",
              column: "crewregistry"
            },
            example: "OP4641"
          },
          {
            name: "arcref",
            type: "text",
            description: "Project",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "projects",
              column: "arcregistry"
            },
            example: "PR7509"
          },
          {
            name: "reg_accuracy",
            type: "jsonb",
            description: "Registration accuracy metrics (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              root: {
                description: "Registration accuracy",
                fields: [
                  {
                    name: "Log_Accu_Mm",
                    type: "REAL",
                    description: "Registration accuracy (mm)",
                    example: 0.84
                  },
                  {
                    name: "Ref_Mark",
                    type: "TEXT",
                    description: "Reference markers used",
                    example: 40
                  },
                  {
                    name: "Ctrl_Pts",
                    type: "TEXT",
                    description: "Control points used",
                    example: 73
                  },
                  {
                    name: "Log_Method",
                    type: "TEXT",
                    description: "Registration method",
                    possible_values: [
                      "Feature-based",
                      "Hybrid",
                      "Target-based"
                    ]
                  },
                  {
                    name: "Transform",
                    type: "TEXT",
                    description: "Transformation matrix applied",
                    example: "Matrix-47"
                  },
                  {
                    name: "Err_Scale",
                    type: "TEXT",
                    description: "Error metric standard",
                    possible_values: [
                      "Cloud-to-Cloud",
                      "Cloud-to-Mesh",
                      "RMSE"
                    ]
                  },
                  {
                    name: "Err_Val_Mm",
                    type: "REAL",
                    description: "Error value (mm)",
                    example: 6.962
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            logregistry: 1,
            crewref: "OP4641",
            arcref: "PR7509",
            reg_accuracy: {
              Ctrl_Pts: "73",
              Ref_Mark: "40",
              Err_Scale: "Cloud-to-Mesh",
              Transform: "Matrix-47",
              Err_Val_Mm: 6.962,
              Log_Method: "Hybrid",
              Log_Accu_Mm: 0.84
            }
          },
          {
            logregistry: 2,
            crewref: "OP8435",
            arcref: "PR8078",
            reg_accuracy: {
              Ctrl_Pts: "6",
              Ref_Mark: "21",
              Err_Scale: "Cloud-to-Mesh",
              Transform: "Matrix-712",
              Err_Val_Mm: 4.442,
              Log_Method: "Target-based",
              Log_Accu_Mm: 3.44
            }
          },
          {
            logregistry: 3,
            crewref: "OP5563",
            arcref: "PR8865",
            reg_accuracy: {
              Ctrl_Pts: "99",
              Ref_Mark: "31",
              Err_Scale: "RMSE",
              Transform: "Matrix-543",
              Err_Val_Mm: 2.963,
              Log_Method: "Hybrid",
              Log_Accu_Mm: 0.17
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "crewref",
            references: {
              table: "personnel",
              column: "crewregistry"
            }
          },
          {
            column: "arcref",
            references: {
              table: "projects",
              column: "arcregistry"
            }
          }
        ]
      },
      {
        name: "processing",
        role: "event log",
        description: "Data processing runs per site and equipment: software, storage location, backup, data access level, metadata standard, coordinate frame, processing stage and rate, plus system usage and calibration status (JSONB).",
        primary_key: [
          "flowregistry"
        ],
        columns: [
          {
            name: "flowregistry",
            type: "bigint",
            description: "Unique processing record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "equipref",
            type: "text",
            description: "Equipment",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "equipment",
              column: "equipregistry"
            },
            example: "SN20065"
          },
          {
            name: "zoneref",
            type: "text",
            description: "Site",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "sites",
              column: "zoneregistry"
            },
            example: "SC9016"
          },
          {
            name: "flowsoft",
            type: "text",
            description: "Processing software. Null = not specified.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "RealityCapture"
          },
          {
            name: "stashloc",
            type: "text",
            description: "Storage location",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Cloud",
              "Local",
              "Network"
            ]
          },
          {
            name: "safebak",
            type: "text",
            description: "Backup status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Completed",
              "In Progress",
              "Pending"
            ]
          },
          {
            name: "datalevel",
            type: "text",
            description: "Data access level",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Confidential",
              "Public",
              "Restricted"
            ]
          },
          {
            name: "metabench",
            type: "text",
            description: "Metadata standard",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "CIDOC CRM",
              "Custom",
              "Dublin Core"
            ]
          },
          {
            name: "coordframe",
            type: "text",
            description: "Coordinate system (inconsistent casing in data)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "CUSTOM",
              "Custom",
              "LOCAL",
              "Local",
              "WGS84",
              "Wgs84",
              "custom",
              "local",
              "wgs84"
            ]
          },
          {
            name: "elevref",
            type: "text",
            description: "Elevation reference datum",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Arbitrary",
              "Local",
              "Sea Level"
            ]
          },
          {
            name: "flowstage",
            type: "text",
            description: "Processing stage",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Aligned",
              "Final",
              "Meshed",
              "Raw",
              "Textured"
            ]
          },
          {
            name: "processing_rate",
            type: "text",
            description: "Processing throughput, stored as text with unit",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "2.3 MB/s"
          },
          {
            name: "system_usage",
            type: "jsonb",
            description: "Computing resource usage (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              root: {
                description: "Resource usage",
                fields: [
                  {
                    name: "Flow_Hrs",
                    type: "REAL",
                    description: "Processing time (hours)",
                    example: 21.9
                  },
                  {
                    name: "Proc_CPU",
                    type: "BIGINT",
                    description: "CPU usage (%)",
                    example: 81
                  },
                  {
                    name: "Mem_Usage_Gb",
                    type: "REAL",
                    description: "Memory usage (GB)",
                    example: 70.3
                  },
                  {
                    name: "Proc_GPU",
                    type: "BIGINT",
                    description: "GPU usage (%)",
                    example: 84
                  },
                  {
                    name: "Remain_Gb",
                    type: "REAL",
                    description: "Remaining storage (GB)",
                    example: 983.5
                  }
                ]
              }
            }
          },
          {
            name: "calib_status",
            type: "jsonb",
            description: "Calibration and correction status (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              root: {
                description: "Calibration",
                fields: [
                  {
                    name: "Station_Link",
                    type: "TEXT",
                    description: "Total station integration. Null = not integrated.",
                    example: "Partial"
                  },
                  {
                    name: "Cam_Cal",
                    type: "TEXT",
                    description: "Camera calibration",
                    possible_values: [
                      "Calibrated",
                      "Invalid",
                      "Required"
                    ]
                  },
                  {
                    name: "Lens_Dist",
                    type: "TEXT",
                    description: "Lens distortion correction",
                    possible_values: [
                      "Corrected",
                      "Uncorrected",
                      "Unknown"
                    ]
                  },
                  {
                    name: "Color_Tune",
                    type: "TEXT",
                    description: "Colour calibration. Null = not performed.",
                    possible_values: [
                      "Adjusted",
                      "Required"
                    ]
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            flowregistry: 1,
            equipref: "SN20065",
            zoneref: "SC9016",
            flowsoft: "RealityCapture",
            stashloc: "Local",
            safebak: "In Progress",
            datalevel: "Confidential",
            metabench: "Dublin Core",
            coordframe: "Local",
            elevref: "Arbitrary",
            flowstage: "Aligned",
            processing_rate: "2.3 MB/s",
            system_usage: {
              Flow_Hrs: 21.9,
              Proc_CPU: 81,
              Proc_GPU: 84,
              Remain_Gb: 983.5,
              Mem_Usage_Gb: 70.3
            },
            calib_status: {
              Cam_Cal: "Invalid",
              Lens_Dist: "Corrected",
              Color_Tune: "Required",
              Station_Link: "Partial"
            }
          },
          {
            flowregistry: 2,
            equipref: "SN83019",
            zoneref: "SC4817",
            flowsoft: null,
            stashloc: "Network",
            safebak: "Pending",
            datalevel: "Confidential",
            metabench: "CIDOC CRM",
            coordframe: "Custom",
            elevref: "Sea Level",
            flowstage: "Meshed",
            processing_rate: "4.0 MB/s",
            system_usage: {
              Flow_Hrs: 25.7,
              Proc_CPU: 67,
              Proc_GPU: 66,
              Remain_Gb: 306.1,
              Mem_Usage_Gb: 51.7
            },
            calib_status: {
              Cam_Cal: "Required",
              Lens_Dist: "Unknown",
              Color_Tune: "Adjusted",
              Station_Link: "Partial"
            }
          },
          {
            flowregistry: 3,
            equipref: "SN60801",
            zoneref: "SC4082",
            flowsoft: "RealityCapture",
            stashloc: "Cloud",
            safebak: "Completed",
            datalevel: "Restricted",
            metabench: "Custom",
            coordframe: "Local",
            elevref: "Arbitrary",
            flowstage: "Final",
            processing_rate: "5.7 MB/s",
            system_usage: {
              Flow_Hrs: 16.5,
              Proc_CPU: 80,
              Proc_GPU: 78,
              Remain_Gb: 487.3,
              Mem_Usage_Gb: 79.5
            },
            calib_status: {
              Cam_Cal: "Invalid",
              Lens_Dist: "Corrected",
              Color_Tune: "Required",
              Station_Link: "Partial"
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "equipref",
            references: {
              table: "equipment",
              column: "equipregistry"
            }
          },
          {
            column: "zoneref",
            references: {
              table: "sites",
              column: "zoneregistry"
            }
          }
        ]
      },
      {
        name: "qualitycontrol",
        role: "event log",
        description: "Quality control, validation, archiving, publication and copyright status per project and operator.",
        primary_key: [
          "qualregistry"
        ],
        columns: [
          {
            name: "qualregistry",
            type: "bigint",
            description: "Unique quality control record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null
          },
          {
            name: "arcref",
            type: "text",
            description: "Project",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "projects",
              column: "arcregistry"
            },
            example: "PR7509"
          },
          {
            name: "crewref",
            type: "text",
            description: "Operator",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "personnel",
              column: "crewregistry"
            },
            example: "OP4641"
          },
          {
            name: "accucheck",
            type: "text",
            description: "Accuracy assessment, stored as descriptive text",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Accuracy check not required, standard quality sufficient"
          },
          {
            name: "ctrlstate",
            type: "text",
            description: "Quality control status",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Failed",
              "Passed",
              "Pending"
            ]
          },
          {
            name: "valimeth",
            type: "text",
            description: "Validation method",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            possible_values: [
              "Automated",
              "Hybrid",
              "Visual"
            ]
          },
          {
            name: "valistate",
            type: "text",
            description: "Validation outcome, stored as descriptive text",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Validation rejected, data quality issues identified"
          },
          {
            name: "archstat",
            type: "text",
            description: "Archival status. Null = not initiated.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Verified"
          },
          {
            name: "pubstat",
            type: "text",
            description: "Publication status, stored as descriptive text",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Draft status, preparation for submission"
          },
          {
            name: "copystat",
            type: "text",
            description: "Copyright status. Null = not established.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Open Access"
          },
          {
            name: "refmention",
            type: "text",
            description: "Citation requirement",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Citation-8447"
          },
          {
            name: "remark",
            type: "text",
            description: "Additional notes. Null = none.",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            example: "Bed something performance leader realize."
          }
        ],
        sample_rows: [
          {
            qualregistry: 1,
            arcref: "PR7509",
            crewref: "OP4641",
            accucheck: "Accuracy check not required, standard quality sufficient",
            ctrlstate: "Pending",
            valimeth: "Automated",
            valistate: "Validation rejected, data quality issues identified",
            archstat: "Verified",
            pubstat: "Draft status, preparation for submission",
            copystat: null,
            refmention: "Citation-8447",
            remark: null
          },
          {
            qualregistry: 2,
            arcref: "PR8078",
            crewref: "OP8435",
            accucheck: "Accuracy check completed, validation successful",
            ctrlstate: "Pending",
            valimeth: "Visual",
            valistate: "Validation rejected, data quality issues identified",
            archstat: "Verified",
            pubstat: "Submitted status, under editorial review",
            copystat: "Open Access",
            refmention: "Citation-6197",
            remark: null
          },
          {
            qualregistry: 3,
            arcref: "PR8865",
            crewref: "OP5563",
            accucheck: "Accuracy check pending, validation in progress",
            ctrlstate: "Pending",
            valimeth: "Automated",
            valistate: "Validation approved, data quality meets standards",
            archstat: "Verified",
            pubstat: "Submitted status, under editorial review",
            copystat: "restricted",
            refmention: "Citation-2238",
            remark: "Bed something performance leader realize."
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "arcref",
            references: {
              table: "projects",
              column: "arcregistry"
            }
          },
          {
            column: "crewref",
            references: {
              table: "personnel",
              column: "crewregistry"
            }
          }
        ]
      }
    ],
    relationships: [
      {
        from: "scans.arcref",
        to: "projects.arcregistry",
        type: "many-to-one",
        meaning: "Each scans row references one projects row"
      },
      {
        from: "scans.crewref",
        to: "personnel.crewregistry",
        type: "many-to-one",
        meaning: "Each scans row references one personnel row"
      },
      {
        from: "scans.zoneref",
        to: "sites.zoneregistry",
        type: "many-to-one",
        meaning: "Each scans row references one sites row"
      },
      {
        from: "environment.zoneref",
        to: "sites.zoneregistry",
        type: "many-to-one",
        meaning: "Each environment row references one sites row"
      },
      {
        from: "environment.equipref",
        to: "equipment.equipregistry",
        type: "many-to-one",
        meaning: "Each environment row references one equipment row"
      },
      {
        from: "pointcloud.crewref",
        to: "personnel.crewregistry",
        type: "many-to-one",
        meaning: "Each pointcloud row references one personnel row"
      },
      {
        from: "pointcloud.arcref",
        to: "projects.arcregistry",
        type: "many-to-one",
        meaning: "Each pointcloud row references one projects row"
      },
      {
        from: "mesh.zoneref",
        to: "sites.zoneregistry",
        type: "many-to-one",
        meaning: "Each mesh row references one sites row"
      },
      {
        from: "mesh.equipref",
        to: "equipment.equipregistry",
        type: "many-to-one",
        meaning: "Each mesh row references one equipment row"
      },
      {
        from: "spatial.arcref",
        to: "projects.arcregistry",
        type: "many-to-one",
        meaning: "Each spatial row references one projects row"
      },
      {
        from: "spatial.crewref",
        to: "personnel.crewregistry",
        type: "many-to-one",
        meaning: "Each spatial row references one personnel row"
      },
      {
        from: "features.zoneref",
        to: "sites.zoneregistry",
        type: "many-to-one",
        meaning: "Each features row references one sites row"
      },
      {
        from: "features.equipref",
        to: "equipment.equipregistry",
        type: "many-to-one",
        meaning: "Each features row references one equipment row"
      },
      {
        from: "conservation.arcref",
        to: "projects.arcregistry",
        type: "many-to-one",
        meaning: "Each conservation row references one projects row"
      },
      {
        from: "conservation.zoneref",
        to: "sites.zoneregistry",
        type: "many-to-one",
        meaning: "Each conservation row references one sites row"
      },
      {
        from: "registration.crewref",
        to: "personnel.crewregistry",
        type: "many-to-one",
        meaning: "Each registration row references one personnel row"
      },
      {
        from: "registration.arcref",
        to: "projects.arcregistry",
        type: "many-to-one",
        meaning: "Each registration row references one projects row"
      },
      {
        from: "processing.equipref",
        to: "equipment.equipregistry",
        type: "many-to-one",
        meaning: "Each processing row references one equipment row"
      },
      {
        from: "processing.zoneref",
        to: "sites.zoneregistry",
        type: "many-to-one",
        meaning: "Each processing row references one sites row"
      },
      {
        from: "qualitycontrol.arcref",
        to: "projects.arcregistry",
        type: "many-to-one",
        meaning: "Each qualitycontrol row references one projects row"
      },
      {
        from: "qualitycontrol.crewref",
        to: "personnel.crewregistry",
        type: "many-to-one",
        meaning: "Each qualitycontrol row references one personnel row"
      }
    ]
  },
  {
    id: "households",
    name: "Household Socioeconomic Survey",
    domain: "Demographics / household socioeconomics and housing (Brazil)",
    description: "Household survey data from administrative regions of Brazil: household size and location, tenure and income bracket, dwelling type and rooms, infrastructure (water, road, parking), amenities, social services enrolment and vehicle ownership. Text values are deliberately messy with inconsistent casing and spacing.",
    engine: "PostgreSQL",
    source: {
      benchmark: "BIRD-Interact (full)",
      dataset_url: "https://huggingface.co/datasets/birdsql/bird-interact-full",
      folder: "households",
      paper: "https://arxiv.org/abs/2510.05318",
      license: "CC BY-SA 4.0",
      attribution: "BIRD Team & Google Cloud"
    },
    what_you_can_ask: [
      "Household size and income distribution",
      "Housing type, rooms and tenure",
      "Water, road and parking infrastructure by region",
      "Vehicle ownership",
      "Social service and domestic help coverage",
      "Comparisons across regions and macrozones"
    ],
    stats: {
      table_count: 7,
      jsonb_column_count: 3,
      row_counts_note: "Row counts are null because the dump is not hosted on Hugging Face; fill after loading it."
    },
    tables: [
      {
        name: "households",
        role: "core entity",
        description: "One row per household: size, location (region and macrozone), enrolled social service plan, and socioeconomic profile (tenure, income bracket, expenditure) as JSONB. Values are intentionally messy (mixed casing), e.g. 'Owned', 'owned', 'OWNED'.",
        primary_key: [
          "housenum"
        ],
        columns: [
          {
            name: "housenum",
            type: "bigint",
            description: "Unique household identifier",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: 4
          },
          {
            name: "residentcount",
            type: "bigint",
            description: "Number of people living in the household",
            nullable: false,
            is_primary_key: false,
            foreign_key: null,
            example: 4
          },
          {
            name: "locregion",
            type: "text",
            description: "Administrative region. Part of composite foreign key (locregion, loczone) to locations(regioncode, zonenum).",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "locations",
              column: "regioncode"
            },
            example: "Taguatinga"
          },
          {
            name: "loczone",
            type: "bigint",
            description: "Macrozone number. Part of composite foreign key (locregion, loczone) to locations(regioncode, zonenum).",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "locations",
              column: "zonenum"
            },
            example: 315
          },
          {
            name: "serviceplan",
            type: "bigint",
            description: "Social service plan the household is enrolled in. Null = not enrolled or undetermined.",
            nullable: true,
            is_primary_key: false,
            foreign_key: {
              table: "service_types",
              column: "serviceref"
            },
            example: 1
          },
          {
            name: "socioeconomic",
            type: "jsonb",
            description: "Tenure, income bracket and expenditure (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              root: {
                description: "Socioeconomic profile",
                fields: [
                  {
                    name: "Tenure_Type",
                    type: "TEXT",
                    description: "Ownership or occupancy status. Null = unknown or disputed. Casing varies.",
                    example: "OWNED"
                  },
                  {
                    name: "Income_Bracket",
                    type: "TEXT",
                    description: "Income classification in Brazilian reais. Null = not disclosed.",
                    example: "More than R$ 1,760 and less than R$ 2,640"
                  },
                  {
                    name: "Expend_Coeff",
                    type: "REAL",
                    description: "Household expenditure coefficient. Null = not available.",
                    example: 60.6315
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            housenum: 4,
            residentcount: 4,
            locregion: "Taguatinga",
            loczone: 315,
            serviceplan: 1,
            socioeconomic: {
              Tenure_Type: "Owned",
              Expend_Coeff: 33.78,
              Income_Bracket: "More than R$ 1,760 and less than R$ 2,640"
            }
          },
          {
            housenum: 7,
            residentcount: 3,
            locregion: "Taguatinga",
            loczone: 315,
            serviceplan: 1,
            socioeconomic: {
              Tenure_Type: "owned",
              Expend_Coeff: 37.1846,
              Income_Bracket: "More than R$ 2,640 and less than R$ 4,400"
            }
          },
          {
            housenum: 22,
            residentcount: 3,
            locregion: "Taguatinga",
            loczone: 315,
            serviceplan: 1,
            socioeconomic: {
              Tenure_Type: "OWNED",
              Expend_Coeff: 37.2258,
              Income_Bracket: "More than R$ 4,400 and less than R$ 8,800"
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "locregion",
            references: {
              table: "locations",
              column: "regioncode"
            }
          },
          {
            column: "loczone",
            references: {
              table: "locations",
              column: "zonenum"
            }
          },
          {
            column: "serviceplan",
            references: {
              table: "service_types",
              column: "serviceref"
            }
          }
        ]
      },
      {
        name: "locations",
        role: "reference / lookup",
        description: "Administrative regions and their macrozones. Composite primary key (regioncode, zonenum); the sample shows the same pair can repeat.",
        primary_key: [
          "regioncode",
          "zonenum"
        ],
        columns: [
          {
            name: "regioncode",
            type: "text",
            description: "Administrative region",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: "Taguatinga"
          },
          {
            name: "zonenum",
            type: "bigint",
            description: "Macrozone number",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: 315
          }
        ],
        sample_rows: [
          {
            regioncode: "Taguatinga",
            zonenum: 315
          },
          {
            regioncode: "Taguatinga",
            zonenum: 315
          },
          {
            regioncode: "Guará",
            zonenum: 222
          }
        ],
        row_count: null,
        foreign_keys: []
      },
      {
        name: "service_types",
        role: "reference / lookup",
        description: "Combinations of domestic-help and social-support service availability that a household can be enrolled in.",
        primary_key: [
          "serviceref"
        ],
        columns: [
          {
            name: "serviceref",
            type: "bigint",
            description: "Unique service plan identifier Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: 1
          },
          {
            name: "domestichelp",
            type: "text",
            description: "Domestic worker availability",
            nullable: false,
            is_primary_key: false,
            foreign_key: null,
            example: "No domestic workers"
          },
          {
            name: "socsupport",
            type: "text",
            description: "Social assistance programme participation",
            nullable: false,
            is_primary_key: false,
            foreign_key: null,
            example: "Yes"
          }
        ],
        sample_rows: [
          {
            serviceref: 1,
            domestichelp: "No domestic workers",
            socsupport: "No"
          },
          {
            serviceref: 14,
            domestichelp: "No domestic workers",
            socsupport: "No"
          },
          {
            serviceref: 21,
            domestichelp: "No domestic workers",
            socsupport: "Yes"
          }
        ],
        row_count: null,
        foreign_keys: []
      },
      {
        name: "infrastructure",
        role: "reference / lookup",
        description: "Combinations of piped-water access, road surface and parking availability around a property. Text values are inconsistent (extra spaces, casing).",
        primary_key: [
          "infraref"
        ],
        columns: [
          {
            name: "infraref",
            type: "bigint",
            description: "Unique infrastructure configuration id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: 1
          },
          {
            name: "wateraccess",
            type: "text",
            description: "Piped water access",
            nullable: false,
            is_primary_key: false,
            foreign_key: null,
            example: "Yes, available at least in one room"
          },
          {
            name: "roadsurface",
            type: "text",
            description: "Road surface type",
            nullable: false,
            is_primary_key: false,
            foreign_key: null,
            example: "Asphalt, concrete"
          },
          {
            name: "parkavail",
            type: "text",
            description: "Private parking availability",
            nullable: false,
            is_primary_key: false,
            foreign_key: null,
            example: "Available"
          }
        ],
        sample_rows: [
          {
            infraref: 1,
            wateraccess: "Yes, available at least in one room",
            roadsurface: "Asphalt, concrete",
            parkavail: "Available"
          },
          {
            infraref: 2,
            wateraccess: "Yes,  available at least in one room",
            roadsurface: "Asphalt, concrete",
            parkavail: "Available"
          },
          {
            infraref: 6,
            wateraccess: "Yes, available at least in one room",
            roadsurface: "Asphalt, concrete",
            parkavail: "Not available"
          }
        ],
        row_count: null,
        foreign_keys: []
      },
      {
        name: "properties",
        role: "detail",
        description: "Residential property of a household (1:1) with its infrastructure configuration and dwelling specs (type, bathrooms, bedrooms) as JSONB.",
        primary_key: [
          "propref"
        ],
        columns: [
          {
            name: "propref",
            type: "bigint",
            description: "Unique property id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: 19
          },
          {
            name: "houselink",
            type: "bigint",
            description: "Household (unique, 1:1)",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "households",
              column: "housenum"
            },
            example: 77,
            is_unique: true
          },
          {
            name: "infralink",
            type: "bigint",
            description: "Infrastructure configuration",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "infrastructure",
              column: "infraref"
            },
            example: 1
          },
          {
            name: "dwelling_specs",
            type: "jsonb",
            description: "Dwelling type and room counts (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              root: {
                description: "Dwelling characteristics",
                fields: [
                  {
                    name: "Dwelling_Class",
                    type: "TEXT",
                    description: "Dwelling type. Null = non-standard or pending. Casing varies.",
                    example: "Brickwork house"
                  },
                  {
                    name: "Bath_Count",
                    type: "BIGINT",
                    description: "Number of bathrooms. Null = unavailable.",
                    example: 1
                  },
                  {
                    name: "Room_Count",
                    type: "BIGINT",
                    description: "Number of bedrooms. Null = unavailable.",
                    example: 3
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            propref: 19,
            houselink: 77,
            infralink: 1,
            dwelling_specs: {
              Bath_Count: 1,
              Room_Count: 3,
              Dwelling_Class: "Brickwork house"
            }
          },
          {
            propref: 20,
            houselink: 102,
            infralink: 1,
            dwelling_specs: {
              Bath_Count: 1,
              Room_Count: 2,
              Dwelling_Class: "apartment"
            }
          },
          {
            propref: 21,
            houselink: 103,
            infralink: 21,
            dwelling_specs: {
              Bath_Count: 1,
              Room_Count: 2,
              Dwelling_Class: "Apartment"
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "houselink",
            references: {
              table: "households",
              column: "housenum"
            }
          },
          {
            column: "infralink",
            references: {
              table: "infrastructure",
              column: "infraref"
            }
          }
        ]
      },
      {
        name: "amenities",
        role: "detail",
        description: "Cable television availability per household (1:1). Values are inconsistent ('avail', 'available', 'Available').",
        primary_key: [
          "amenityref"
        ],
        columns: [
          {
            name: "amenityref",
            type: "bigint",
            description: "Unique amenities record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: 1
          },
          {
            name: "houseid",
            type: "bigint",
            description: "Household (unique, 1:1)",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "households",
              column: "housenum"
            },
            example: 3,
            is_unique: true
          },
          {
            name: "cablestatus",
            type: "text",
            description: "Cable TV availability",
            nullable: false,
            is_primary_key: false,
            foreign_key: null,
            example: "available"
          }
        ],
        sample_rows: [
          {
            amenityref: 1,
            houseid: 3,
            cablestatus: "avail"
          },
          {
            amenityref: 2,
            houseid: 4,
            cablestatus: "available"
          },
          {
            amenityref: 3,
            houseid: 7,
            cablestatus: "Available"
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "houseid",
            references: {
              table: "households",
              column: "housenum"
            }
          }
        ]
      },
      {
        name: "transportation_assets",
        role: "detail",
        description: "Vehicles owned by a household (1:1) as JSONB: counts of cars, bicycles and motorcycles and the year range of the newest vehicle.",
        primary_key: [
          "transref"
        ],
        columns: [
          {
            name: "transref",
            type: "bigint",
            description: "Unique transport record id Auto-generated.",
            nullable: false,
            is_primary_key: true,
            foreign_key: null,
            example: 4
          },
          {
            name: "housetag",
            type: "bigint",
            description: "Household (unique, 1:1)",
            nullable: false,
            is_primary_key: false,
            foreign_key: {
              table: "households",
              column: "housenum"
            },
            example: 22,
            is_unique: true
          },
          {
            name: "vehicleinventory",
            type: "jsonb",
            description: "Vehicle counts and newest vehicle year (see json_schema)",
            nullable: true,
            is_primary_key: false,
            foreign_key: null,
            json_schema: {
              root: {
                description: "Newest vehicle",
                fields: [
                  {
                    name: "Newest_Year",
                    type: "TEXT",
                    description: "Year range of the newest vehicle, stored as text. Null = none or unknown.",
                    example: "after 2014"
                  }
                ]
              },
              vehicle_counts: {
                description: "Vehicle counts",
                fields: [
                  {
                    name: "Auto_Count",
                    type: "BIGINT",
                    description: "Passenger vehicles owned (default 0)",
                    example: 2
                  },
                  {
                    name: "Bike_Count",
                    type: "BIGINT",
                    description: "Bicycles owned (default 0)",
                    example: 0
                  },
                  {
                    name: "Motor_Count",
                    type: "BIGINT",
                    description: "Motorcycles / scooters owned (default 0)",
                    example: 0
                  }
                ]
              }
            }
          }
        ],
        sample_rows: [
          {
            transref: 4,
            housetag: 22,
            vehicleinventory: {
              Newest_Year: "after 2014",
              vehicle_counts: {
                Auto_Count: 2,
                Bike_Count: 0,
                Motor_Count: 0
              }
            }
          },
          {
            transref: 5,
            housetag: 35,
            vehicleinventory: {
              Newest_Year: "2010 TO 2013",
              vehicle_counts: {
                Auto_Count: 1,
                Bike_Count: 1,
                Motor_Count: 0
              }
            }
          },
          {
            transref: 6,
            housetag: 37,
            vehicleinventory: {
              Newest_Year: "nOt apPLIcaBlE",
              vehicle_counts: {
                Auto_Count: 0,
                Bike_Count: 0,
                Motor_Count: 0
              }
            }
          }
        ],
        row_count: null,
        foreign_keys: [
          {
            column: "housetag",
            references: {
              table: "households",
              column: "housenum"
            }
          }
        ]
      }
    ],
    relationships: [
      {
        from: "households.locregion",
        to: "locations.regioncode",
        type: "many-to-one",
        meaning: "Each households row references one locations row"
      },
      {
        from: "households.loczone",
        to: "locations.zonenum",
        type: "many-to-one",
        meaning: "Each households row references one locations row"
      },
      {
        from: "households.serviceplan",
        to: "service_types.serviceref",
        type: "many-to-one",
        meaning: "Each households row references one service_types row"
      },
      {
        from: "properties.houselink",
        to: "households.housenum",
        type: "one-to-one",
        meaning: "Each properties row references one households row"
      },
      {
        from: "properties.infralink",
        to: "infrastructure.infraref",
        type: "many-to-one",
        meaning: "Each properties row references one infrastructure row"
      },
      {
        from: "amenities.houseid",
        to: "households.housenum",
        type: "one-to-one",
        meaning: "Each amenities row references one households row"
      },
      {
        from: "transportation_assets.housetag",
        to: "households.housenum",
        type: "one-to-one",
        meaning: "Each transportation_assets row references one households row"
      }
    ]
  }
]
