import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

// --------------------- Patient Register ---------------------
export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, adhar, dob, gender, password } = req.body;

  // Make Aadhar and Date of Birth optional for patient registration.
  if (!firstName || !lastName || !email || !phone || !gender || !password) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("User already Registered!", 400));
  }

  // Build user payload and include adhar/dob only if provided to preserve compatibility
  const userPayload = {
    firstName,
    lastName,
    email,
    phone,
    gender,
    password,
    role: "Patient",
  };

  if (adhar) userPayload.adhar = adhar;
  if (dob) userPayload.dob = dob;

  const user = await User.create(userPayload);

  generateToken(user, "User Registered Successfully", 200, res);
});

// --------------------- Patient Login ---------------------
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Password & Confirm Password Do Not Match!", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }

  generateToken(user, "User Logged In Successfully", 200, res);
});

// --------------------- Add New Admin ---------------------
export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, adhar, dob, gender, password } = req.body;

  if (!firstName || !lastName || !email || !phone || !adhar || !dob || !gender || !password) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("Admin With This Email Already Exists!", 400));
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    adhar,
    dob,
    gender,
    password,
    role: "Admin",
  });

  res.status(200).json({
    success: true,
    message: "New Admin Registered",
    admin,
  });
});

// --------------------- Get All Doctors ---------------------
export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({
    success: true,
    doctors,
  });
});

// --------------------- Get User Details ---------------------
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

// --------------------- Logout Admin ---------------------
export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  // Clear cookie explicitly to ensure browser removes it
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Admin Logged Out Successfully.",
  });
});

// --------------------- Logout Patient ---------------------
export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  // Clear cookie explicitly to ensure browser removes it
  res.clearCookie("patientToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Patient Logged Out Successfully.",
  });
});

// --------------------- Add New Doctor ---------------------
export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Doctor Avatar Required!", 400));
  }

  const { docAvatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(new ErrorHandler("File Format Not Supported!", 400));
  }

  const { firstName, lastName, email, phone, adhar, dob, gender, password, doctorDepartment } = req.body;

  if (!firstName || !lastName || !email || !phone || !adhar || !dob || !gender || !password || !doctorDepartment || !docAvatar) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("Doctor With This Email Already Exists!", 400));
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(docAvatar.tempFilePath);
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown Cloudinary error");
    return next(new ErrorHandler("Failed To Upload Doctor Avatar To Cloudinary", 500));
  }

  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    adhar,
    dob,
    gender,
    password,
    role: "Doctor",
    doctorDepartment,
    docAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "New Doctor Registered",
    doctor,
  });
});



// import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
// import { User } from "../models/userSchema.js";
// import ErrorHandler from "../middlewares/error.js";
// import { generateToken } from "../utils/jwtToken.js";
// import cloudinary from "cloudinary";

// // --------------------- Patient Register ---------------------
// export const patientRegister = catchAsyncErrors(async (req, res, next) => {
//   const { firstName, lastName, email, phone, adhar, dob, gender, password } = req.body;

//   if (!firstName || !lastName || !email || !phone || !adhar || !dob || !gender || !password) {
//     return next(new ErrorHandler("Please Fill Full Form!", 400));
//   }

//   const isRegistered = await User.findOne({ email });
//   if (isRegistered) {
//     return next(new ErrorHandler("User already Registered!", 400));
//   }

//   const user = await User.create({
//     firstName,
//     lastName,
//     email,
//     phone,
//     adhar,
//     dob,
//     gender,
//     password,
//     role: "Patient", // hardcoded for security
//   });

//   generateToken(user, "User Registered Successfully", 200, res);
// });

// // --------------------- Patient Login ---------------------
// export const login = catchAsyncErrors(async (req, res, next) => {
//   const { email, password, confirmPassword } = req.body;

//   if (!email || !password || !confirmPassword) {
//     return next(new ErrorHandler("Please Fill Full Form!", 400));
//   }

//   if (password !== confirmPassword) {
//     return next(new ErrorHandler("Password & Confirm Password Do Not Match!", 400));
//   }

//   const user = await User.findOne({ email }).select("+password");
//   if (!user) {
//     return next(new ErrorHandler("Invalid Email Or Password!", 400));
//   }

//   const isPasswordMatch = await user.comparePassword(password);
//   if (!isPasswordMatch) {
//     return next(new ErrorHandler("Invalid Email Or Password!", 400));
//   }

//   generateToken(user, "User Logged In Successfully", 200, res);
// });

// // --------------------- Add New Admin ---------------------
// export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
//   const { firstName, lastName, email, phone, adhar, dob, gender, password } = req.body;

//   if (!firstName || !lastName || !email || !phone || !adhar || !dob || !gender || !password) {
//     return next(new ErrorHandler("Please Fill Full Form!", 400));
//   }

//   const isRegistered = await User.findOne({ email });
//   if (isRegistered) {
//     return next(new ErrorHandler("Admin With This Email Already Exists!", 400));
//   }

//   const admin = await User.create({
//     firstName,
//     lastName,
//     email,
//     phone,
//     adhar,
//     dob,
//     gender,
//     password,
//     role: "Admin",
//   });

//   res.status(200).json({
//     success: true,
//     message: "New Admin Registered",
//     admin,
//   });
// });

// // --------------------- Get All Doctors ---------------------
// export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
//   const doctors = await User.find({ role: "Doctor" });
//   res.status(200).json({
//     success: true,
//     doctors,
//   });
// });

// // --------------------- Get User Details ---------------------
// export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
//   const user = req.user;
//   res.status(200).json({
//     success: true,
//     user,
//   });
// });

// // --------------------- Logout Admin ---------------------
// export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
//   res
//     .status(200)
//     .cookie("adminToken", "", {
//       httpOnly: true,
//       secure: true,       // HTTPS required for Vercel
//       sameSite: "none",
//       expires: new Date(Date.now()),
//     })
//     .json({
//       success: true,
//       message: "Admin Logged Out Successfully.",
//     });
// });

// // --------------------- Logout Patient ---------------------
// export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
//   res
//     .status(200)
//     .cookie("patientToken", "", {
//       httpOnly: true,
//       secure: true,       // HTTPS required for Vercel
//       sameSite: "none",
//       expires: new Date(Date.now()),
//     })
//     .json({
//       success: true,
//       message: "Patient Logged Out Successfully.",
//     });
// });

// // --------------------- Add New Doctor ---------------------
// export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
//   if (!req.files || Object.keys(req.files).length === 0) {
//     return next(new ErrorHandler("Doctor Avatar Required!", 400));
//   }

//   const { docAvatar } = req.files;
//   const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
//   if (!allowedFormats.includes(docAvatar.mimetype)) {
//     return next(new ErrorHandler("File Format Not Supported!", 400));
//   }

//   const { firstName, lastName, email, phone, adhar, dob, gender, password, doctorDepartment } = req.body;

//   if (!firstName || !lastName || !email || !phone || !adhar || !dob || !gender || !password || !doctorDepartment || !docAvatar) {
//     return next(new ErrorHandler("Please Fill Full Form!", 400));
//   }

//   const isRegistered = await User.findOne({ email });
//   if (isRegistered) {
//     return next(new ErrorHandler("Doctor With This Email Already Exists!", 400));
//   }

//   const cloudinaryResponse = await cloudinary.uploader.upload(docAvatar.tempFilePath);
//   if (!cloudinaryResponse || cloudinaryResponse.error) {
//     console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown Cloudinary error");
//     return next(new ErrorHandler("Failed To Upload Doctor Avatar To Cloudinary", 500));
//   }

//   const doctor = await User.create({
//     firstName,
//     lastName,
//     email,
//     phone,
//     adhar,
//     dob,
//     gender,
//     password,
//     role: "Doctor",
//     doctorDepartment,
//     docAvatar: {
//       public_id: cloudinaryResponse.public_id,
//       url: cloudinaryResponse.secure_url,
//     },
//   });

//   res.status(200).json({
//     success: true,
//     message: "New Doctor Registered",
//     doctor,
//   });
// });



// import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
// import { User } from "../models/userSchema.js";
// import ErrorHandler from "../middlewares/error.js";
// import {generateToken} from "../utils/jwtToken.js";
// import cloudinary from "cloudinary"


// export const patientRegister = catchAsyncErrors(async (req, res, next) => {
//   const { firstName, lastName, email, phone, adhar, dob, gender, password, role} =
//     req.body;
//   if (
//     !firstName ||
//     !lastName ||
//     !email ||
//     !phone ||
//     !adhar ||
//     !dob ||
//     !gender ||
//     !password ||
//     !role

//   ) {
//     return next(new ErrorHandler("Please Fill Full Form!", 400));
//   }

//   const isRegistered = await User.findOne({ email });
//   if (isRegistered) {
//     return next(new ErrorHandler("User already Registered!", 400));
//   }

//   const user = await User.create({
//     firstName,
//     lastName,
//     email,
//     phone,
//     adhar,
//     dob,
//     gender,
//     password,
//     role:"Patient",
//   });
//    generateToken(user, "user Registered", 200, res)
// });



// export const login = catchAsyncErrors(async (req, res, next) => {
//   const { email, password, confirmPassword, role } = req.body;
//   if (!email || !password || !confirmPassword || !role) {
//     return next(new ErrorHandler("Please Fill Full Form!", 400));
//   }
//   if (password !== confirmPassword) {
//     return next(
//       new ErrorHandler("Password & Confirm Password Do Not Match!", 400)
//     );
//   }
//   const user = await User.findOne({ email }).select("+password");
//   if (!user) {
//     return next(new ErrorHandler("Invalid Email Or Password!", 400));
//   }

//   const isPasswordMatch = await user.comparePassword(password);
//   if (!isPasswordMatch) {
//     return next(new ErrorHandler("Invalid Email Or Password!", 400));
//   }
//   if (role !== user.role) {
//     return next(new ErrorHandler(`User Not Found With This Role!`, 400));
//   }
//    generateToken(user, "user logined", 200, res)
// }) ;
 

// export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
//   const { firstName, lastName, email, phone, adhar, dob, gender, password } =
//     req.body;
//   if (
//     !firstName ||
//     !lastName ||
//     !email ||
//     !phone ||
//     !adhar ||
//     !dob ||
//     !gender ||
//     !password
//   ) {
//     return next(new ErrorHandler("Please Fill Full Form!", 400));
//   }

//   const isRegistered = await User.findOne({ email });
//   if (isRegistered) {
//     return next(new ErrorHandler("Admin With This Email Already Exists!", 400));
//   }

//   const admin = await User.create({
//     firstName,
//     lastName,
//     email,
//     phone,
//     adhar,
//     dob,
//     gender,
//     password,
//     role: "Admin",
//   });
//   res.status(200).json({
//     success: true,
//     message: "New Admin Registered",
//     admin,
//   });
// });

// export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
//   const doctors = await User.find({ role: "Doctor" });
//   res.status(200).json({
//     success: true,
//     doctors,
//   });
// });

// export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
//   const user = req.user;
//   res.status(200).json({
//     success: true,
//     user,
//   });
// });

// // Logout function for dashboard admin
// export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
//   res
//     .status(201)
//     .cookie("adminToken", "", {
//       httpOnly: true,
//       expires: new Date(Date.now()),
//     })
//     .json({
//       success: true,
//       message: "Admin Logged Out Successfully.",
//     });
// });

// // Logout function for frontend patient
// export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
//   res
//     .status(201)
//     .cookie("patientToken", "", {
//       httpOnly: true,
//       expires: new Date(Date.now()),
//     })
//     .json({
//       success: true,
//       message: "Patient Logged Out Successfully.",
//     });
// });


// export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
//   if (!req.files || Object.keys(req.files).length === 0) {
//     return next(new ErrorHandler("Doctor Avatar Required!", 400));
//   }
//   const { docAvatar } = req.files;
//   const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
//   if (!allowedFormats.includes(docAvatar.mimetype)) {
//     return next(new ErrorHandler("File Format Not Supported!", 400));
//   }
//   const {
//     firstName,
//     lastName,
//     email,
//     phone,
//     adhar,
//     dob,
//     gender,
//     password,
//     doctorDepartment,
//   } = req.body;
//   if (
//     !firstName ||
//     !lastName ||
//     !email ||
//     !phone ||
//     !adhar ||
//     !dob ||
//     !gender ||
//     !password ||
//     !doctorDepartment ||
//     !docAvatar
//   ) {
//     return next(new ErrorHandler("Please Fill Full Form!", 400));
//   }
//   const isRegistered = await User.findOne({ email });
//   if (isRegistered) {
//     return next(
//       new ErrorHandler("Doctor With This Email Already Exists!", 400)
//     );
//   }
//   const cloudinaryResponse = await cloudinary.uploader.upload(
//     docAvatar.tempFilePath
//   );
//   if (!cloudinaryResponse || cloudinaryResponse.error) {
//     console.error(
//       "Cloudinary Error:",
//       cloudinaryResponse.error || "Unknown Cloudinary error"
//     );
//     return next(
//       new ErrorHandler("Failed To Upload Doctor Avatar To Cloudinary", 500)
//     );
//   }
//   const doctor = await User.create({
//     firstName,
//     lastName,
//     email,
//     phone,
//     adhar,
//     dob,
//     gender,
//     password,
//     role: "Doctor",
//     doctorDepartment,
//     docAvatar: {
//       public_id: cloudinaryResponse.public_id,
//       url: cloudinaryResponse.secure_url,
//     },
//   });
//   res.status(200).json({
//     success: true,
//     message: "New Doctor Registered",
//     doctor,
//   });
// });

