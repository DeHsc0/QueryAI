"use client"
import axios from "axios"
import { useEffect } from "react"


export default function Dashboard () {

    useEffect(() => {

        const fetchResults = async () => {

            const response = await axios.post("http://localhost:8000/api/database" , {

                database_name : "sadasdasd",
                description  : "adsadasdasd",
                creds : {
                    
                    database_type  : "mysql",
                    host : "asdasdadsasd",
                    user : "asdasdsa",
                    password : "asdasdasdasd" ,
                    database : "asdasdasdasda",
                    port : 12331

                }

            } , { withCredentials : true })


        }

        fetchResults()


    } , [])

    return <div>





    </div>

}