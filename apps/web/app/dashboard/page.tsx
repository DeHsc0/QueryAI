"use client"
import axios from "axios"
import { useEffect } from "react"


export default function Dashboard () {

    useEffect(() => {

        const fetchResults = async () => {

            const response = await axios.post("http://localhost:8000/api/database" , {

            
                host : "localhost",
                user : "root",
                password : "password",
                port : 3306,
                database: "my_database"

            } , { withCredentials : true })


        }

        fetchResults()


    } , [])

    return <div>





    </div>

}