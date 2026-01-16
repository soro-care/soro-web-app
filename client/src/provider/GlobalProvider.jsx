import { createContext,useContext} from "react";


export const GlobalContext = createContext(null)

export const useGlobalContext = ()=> useContext(GlobalContext)

const GlobalProvider = ({children}) => {
   
  
    return(
        <GlobalContext.Provider value={{
     
        }}>
            {children}
        </GlobalContext.Provider>
    )
}

export default GlobalProvider