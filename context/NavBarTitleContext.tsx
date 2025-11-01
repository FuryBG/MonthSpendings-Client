import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";

interface TitleContextType {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
}

interface TitleProviderProps {
  children: ReactNode;
}

const NavBarTitleContext = createContext<TitleContextType | null>(null);


export const TitleProvider = ({ children }: TitleProviderProps) => {
  const [title, setTitle] = useState("");

  return (
    <NavBarTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </NavBarTitleContext.Provider>
  );
};

export const useTitle = (): TitleContextType => {
  const context = useContext(NavBarTitleContext);

  if (!context) {
    throw new Error("useTitle must be used within a TitleProvider");
  }

  return context;
};