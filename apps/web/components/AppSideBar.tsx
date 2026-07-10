import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { BotMessageSquare, BrainCircuit, ChartColumn, Database, History } from "lucide-react"

export function AppSidebar() {



  const menu = [ {

    icon : Database,
    title : "Connection"

  },

  {

    icon : BotMessageSquare,
    title : "Ask AI"

  },

  {

    icon : History,
    title : "Query History"

  },

  {

    icon : ChartColumn,
    title : "Analytics"

  }
  
 ]


  return (
    <Sidebar className="">
      <SidebarHeader className="flex py-5 px-6">

        <div className="flex items-center gap-2">

            <div className="px-2 py-2 border-2 bg-[#00D4A0] rounded-xl">

                <BrainCircuit className="size-5 text-black"/>

            </div>

            <h1 className="font-mono text-white font-semibold">

                QueryAI

            </h1>

        </div>

      </SidebarHeader>
      <SidebarContent className="px-3">

        <SidebarMenu className="px-3">

          <SidebarMenuItem >
              
              <SidebarMenuButton size={"default"} className="[&>svg]:size-5 hover:bg-[#1A1A22]" asChild>

                <div className="flex justify-start gap-2">

                  <Database color="#00D4A0" />

                  <h1 className="text-md font-mono ">
                    Connection
                  </h1>

                </div>

              </SidebarMenuButton>
            
            </SidebarMenuItem>
            

        </SidebarMenu>
      
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}