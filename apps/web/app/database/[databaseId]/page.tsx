"use client"
import axios from "axios";
import {  useEffect, useState } from "react";

export default function Database ({ params } : { params : { databaseId : string } } ) {

    const [ chatInput , setChatInput ] = useState<string>("")

    const [ databaseId , setDatabaseId] = useState<string>("")

    async function getParams (){

        const { databaseId } = await params
        setDatabaseId(databaseId)

    }

    useEffect(() => {

        getParams()

    } , []) 

    const threadId =  crypto.randomUUID();

    async function chat () {

        const result = await axios.post("http://localhost:8000/api/chat/" , {
            
            conversation_id : "11ccc471-6403-4229-bf82-d73ede25e4b6",
            query : chatInput,
            db_id : databaseId  

        } , { withCredentials : true })

    }

    async function getCon () {

        const result = await axios.get(
            "http://localhost:8000/api/turns",
            {
            params: {
                id: "3ff2bd38-81fd-4b6c-8b0e-cc50c19a6232",
                thread_id: "3ff2bd38-81fd-4b6c-8b0e-cc50c19a6231",
            },
            withCredentials: true,
            }
        );

    }
    
    // async function getCon () {

    //     const result = await axios.get(
    //         "http://localhost:8000/api/database",
    //         {
    //             withCredentials: true,
    //         }
    //     );

    //     console.log(result)

    // }

    async function testRunQueryTool () {

        const result = axios.post("http://localhost:8000/api/test" , {

            raw_creds : "gAAAAABqmGNi-T2eK-rmRui68TvqWedQsB5Q77UTn8lTt8FDOla558bGi9cH3eLYhFs_BzeOFwmc6ImSkGPQTatPKBZL9oeufhy2QvRiI6frs9key9yFVJRm6fE8pmgvsob_zgrSx9441jmtKhw6KY7T-AkQFDwg8bNVJ93r500GV1wdCQngzQBgexawrhou7VtApp75Gr0JB-H_71N1lxRR_NNW9QXdjE-Fa4cysNpsshtM53KHd8as7ARAdTkgvW6HC6W197s03YPpfh_AHXbNrYTaS2WB4A==", 
            query : `WITH category_titles AS (
SELECT c.name AS category, COUNT(fc.film_id) AS title_count
FROM film_category fc
JOIN category c ON fc.category_id = c.category_id
GROUP BY c.name
),
category_revenue AS (
SELECT c.name AS category, SUM(p.amount) AS total_revenue
FROM payment p
JOIN rental r ON p.rental_id = r.rental_id
JOIN inventory i ON r.inventory_id = i.inventory_id
JOIN film f ON i.film_id = f.film_id
JOIN film_category fc ON f.film_id = fc.film_id
JOIN category c ON fc.category_id = c.category_id
GROUP BY c.name
)
SELECT ct.category,
ct.title_count,
ROUND(COALESCE(cr.total_revenue, 0), 2) AS total_revenue
FROM category_titles ct
LEFT JOIN category_revenue cr ON ct.category = cr.category
ORDER BY total_revenue DESC NULLS LAST;`

        } , { withCredentials : true })

    }

    return (

        <div className="flex gap-3 my-4 mx-4">

            <input type="text" className="px-4 py-3 border-white rounded-lg border-2" onChange={(e) => {

                setChatInput(e.currentTarget.value)    

            }} />

            <button className="px-4 py-3 border-white rounded-lg border-2 " onClick={chat}>

                Send

            </button>
            <button className="px-4 py-3 border-white rounded-lg border-2 " onClick={getCon}>

                Get COnversation

            </button>
            <button className="px-4 py-3 border-white rounded-lg border-2 " onClick={testRunQueryTool}>

                Test Run SQL Tool

            </button>

        </div>

    )


}