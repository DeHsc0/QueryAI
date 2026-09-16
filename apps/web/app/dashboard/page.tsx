"use client"
import axios from "axios"
import { useEffect } from "react"


export default function Dashboard () {

    useEffect(() => {

        const fetchResults = async () => {

            // sample DB 

            const response = await axios.post("http://localhost:8000/api/database" , {

                database_name : "alien",
                description  : "adsadasdasd",
                creds : {
                    database_type : "postgresql",
                    username      : "root",
                    password      : "123123",
                    host          : "localhost",
                    database      : "alien",
                    port          : 5432

                }

            } , { withCredentials : true })


        }

        fetchResults()


    } , [])

    return <div>





    </div>

}