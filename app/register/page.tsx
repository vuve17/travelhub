// "use client";

// import {
//   Button,
//   IconButton,
//   InputAdornment,
//   Paper,
//   TextField,
//   useTheme
// } from "@mui/material";
// import { useFormik } from "formik";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import React, { useState } from "react";
// import * as Yup from "yup";
// import ErrorBox from "../components/error-message-box";
// // import colors from "../ui/colors";

// export const dynamic = "force-dynamic";

// const registerSchema = Yup.object().shape({
//   email: Yup.string()
//     .email("Please eneter valid email")
//     .required("Email is required"),
//   password: Yup.string().min(6).required("Password is required"),
// });

// const initialValues = {
//   email: "",
//   password: "",
// };

// const LogInForm: React.FC = () => {
//   const [disableButton, setDisableButtons] = useState<boolean>(false);
//   const [passwordState, setPasswordState] = useState("show");
//   const [passwordError, setPasswordError] = useState("");
//   const router = useRouter();
//   const theme = useTheme();

//   const HandlePasswordState = () => {
//     if (passwordState == "show") {
//       setPasswordState("hide");
//     } else {
//       setPasswordState("show");
//     }
//   };

//   const formik = useFormik({
//     initialValues: initialValues,
//     validationSchema: registerSchema,
//     onSubmit: async (values) => {
//       setDisableButtons(true);

//       try {
//         const response = await fetch("/api/log-in", {
//           method: "POST",
//           body: JSON.stringify(values),
//         });

//         if (!response.ok) {
//           console.log("Response error:", response.status, response.statusText);
//           const data = await response.json();
//           console.log("Error message:", data.message);
//           setPasswordError(data.message);
//           console.log("Response not OK");
//         }

//         const { refreshToken, accessToken, message } = await response.json();
//         // console.log(refreshToken, accessToken, message);

//         if (refreshToken && accessToken) {
//           document.cookie = `refreshToken=${refreshToken}; path=/`;
//           document.cookie = `accessToken=${accessToken}; path=/`;
//           // sessionStorage.setItem('cameFromRegister', 'true');
//           router.push("/scheduler");
//         }
//       } catch (error) {
//         console.log("Else set pass error: Bad keys - frontend message");
//         setPasswordError("Wrong username or password");
//       } finally {
//         setDisableButtons(false);
//       }
//     },
//   });

//   return (
//     <Paper
//       square={false}
//       sx={{
//         display: "flex",
//         outline: {
//           lg: `2px solid ${theme.palette.primary.main}`,
//           md: `2px solid ${theme.palette.primary.main}`,
//           sm: "none",
//         },
//         padding: {
//           lg: "2em 5em 2em",
//           md: "2em 5em 2em",
//           sm: "3em",
//           xs: "3em",
//         },
//         flexDirection: "column",
//         boxShadow: "none",
//         alignItems: "center",
//         justifyContent: "center",
//         width: {
//           sm: "100vw",
//           lg: "15em",
//           md: "15em",
//         },
//         // navbar height
//         marginTop: "80px",
//       }}
//     >
//       <form onSubmit={formik.handleSubmit} style={{ marginBottom: "1em" }}>
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             flexDirection: "column",
//           }}
//         >
//           <h1
//             style={{
//               marginTop: "1em",
//               display: "flex",
//               color: `${theme.palette.primary.main}`,
//             }}
//           >
//             Log in
//             <Image
//               src="\svg\login-person.svg"
//               alt="person SVG"
//               width={40}
//               height={40}
//               style={{
//                 marginLeft: "10px",
//               }}
//             />
//           </h1>
//           <TextField
//             label="email"
//             name="email"
//             type="email"
//             value={formik.values.email}
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             style={{
//               marginTop: "1em",
//               minWidth: "267px",
//             }}
//           />

//           <TextField
//             label="password"
//             name="password"
//             type={passwordState === "show" ? "password" : "text"}
//             value={formik.values.password}
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             onClick={() => setPasswordError("")}
//             autoComplete="off"
//             style={{
//               margin: " 1em 0 1em 0 ",
//               minWidth: "267px",
//             }}
//             slotProps={{
//               input: {
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IconButton onClick={HandlePasswordState}>
//                       <Image
//                         src={`/svg/eye-password-${passwordState}.svg`}
//                         alt={`${passwordState} password`}
//                         width={20}
//                         height={20}
//                       />
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               }
//             }}
//           />
//           {formik.errors.email && formik.touched.email ? (
//             <ErrorBox text={formik.errors.email} theme={theme}/>
//           ) : formik.errors.password && formik.touched.password ? (
//             <ErrorBox text={formik.errors.password} />
//           ) : (
//             <ErrorBox text={passwordError} />
//           )}
//         </div>

//         <div style={{ display: "flex", justifyContent: "center" }}>
//           <Button
//             variant="contained"
//             type="submit"
//             sx={{
//               backgroundColor: `${theme.palette.primary.main}`,
//             }}
//             disabled={disableButton}
//           >
//             <div className="openSansSemiBold">Log in</div>
//           </Button>
//         </div>
//       </form>

//       <div
//         style={{
//           marginTop: "1em",
//           display: "flex",
//           justifyContent: "center",
//           flexDirection: "column",
//           alignItems: "center",
//         }}
//       >
//         <div>Don&apos;t have an account? </div>
//         <Link
//           href="/register"
//           style={{
//             marginLeft: "0.1em",
//           }}
//         >
//           Register
//         </Link>
//       </div>
//     </Paper>
//   );
// };

// export default LogInForm;