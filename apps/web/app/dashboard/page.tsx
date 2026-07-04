"use client"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import { useEffect } from "react"

export default function Dashboard () {

    const { getToken } = useAuth() 

    async function fetchData () {
        
        const response = await axios.post( `${process.env.BACKEND_URL}/connect_database` , {

            host: "db.test.supabase.co",
            port: 5432,
            database: "postgres",
            user: "postgres",
            password: "test123123"

        } , {

            headers : {

                Authorization : `Bearer ${await getToken()}`

            }

        })

        console.log("Response :" , response.data)
        

    }

    return <>
    
        <button className="p-4 rounded-2xl" onClick={ async () => await fetchData()}>
            <h1>
                Hello World
            </h1>
        </button>
    
    </>



}