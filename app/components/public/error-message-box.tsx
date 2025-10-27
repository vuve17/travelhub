'use client'

import React from "react";
import { Box } from "@mui/material";
import { Theme } from "@mui/material/styles";

interface ErrorBoxProps {
    text: string,
    theme: Theme
}

const ErrorBox : React.FC<ErrorBoxProps> = ({text, theme}) => {
    return(
        <Box
        sx={{
            width: "100%",
            alignItems: "left",
            color: theme.palette.error.main,
            fontSize: {
                sm: "14px",
            }
        }}
        >
            {text}
        </Box>
    )
}

export default ErrorBox