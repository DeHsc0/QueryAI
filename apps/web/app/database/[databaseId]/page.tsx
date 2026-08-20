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
            
            thread_id : "11ccc471-6403-4229-bf82-d73ede25e4b6",
            query : chatInput,
            db_id : databaseId

        } , { withCredentials : true })

    }

    async function getCon () {

        const result = await axios.get("http://localhost:8000/api/conversation?id=its-working-i-guess"  , { withCredentials : true })

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

        </div>

    )


}