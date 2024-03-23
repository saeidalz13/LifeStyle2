// import { createSlice } from "@reduxjs/toolkit";
// // useful for passing an argument since this would be the type and you can push it to an array
// import type { PayloadAction } from "@reduxjs/toolkit";

// interface UserState {
//   email: string;
//   isSignedIn: boolean;
// }

// const initialState: UserState = {
//   email: "",
//   isSignedIn: false,
// };

// export const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     signedIn(state, action: PayloadAction<string>) {
//       state.email = action.payload;
//       state.isSignedIn = true;
//     },
//     signedOut(state) {
//       state.isSignedIn = false;
//       state.email = "";
//     },
//   },
// });

// export const { signedIn, signedOut } = userSlice.actions;
// export default userSlice.reducer;
