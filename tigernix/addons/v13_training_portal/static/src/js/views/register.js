// const schema = yup.object().shape({
//   name: yup.string().required("Name is required"),
//   // country: yup.string().required("Country is required"),
//   // city: yup.string().required("City is required"),
//   // state: yup.string().required("State is required"),
//   email: yup
//     .string()
//     .email("Invalid email address")
//     .required("Email is required"),
//   password: yup
//     .string()
//     .required("Password is required")
//     .min(8, "Password must be at least 8 characters")
//     .matches(/[a-z]/, "Password must contain at least one lowercase letter")
//     .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
//     .matches(/[0-9]/, "Password must contain at least one number")
//     .matches(
//       /[!@#$%^&*]/,
//       "Password must contain at least one special character",
//     ),
//   confirmPassword: yup
//     .string()
//     .oneOf([yup.ref("password"), undefined, ""], "Passwords must match")
//     .required("Confirm password is required"),
// });

// document.querySelectorAll("input").forEach((input) => {
//   input.addEventListener("change", async (e) => {
//     const field = e.target.name;
//     try {
//       await schema.validateAt(field, getFormData());
//       document.getElementById(`${field}-err`).textContent = "";
//     } catch (err) {
//       document.getElementById(`${field}-err`).textContent = err.message;
//     }
//   });
// });

const onSubmit = (e) => {
  e.preventDefault();
};
