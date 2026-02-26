import React from "react";
import logo from "../../assets/images/logo.png";
import RegisterForm from "../../components/auth/registerform";
function Register() {
    return (
        <div className="">
            <div class="container-fluid ">
                <div class="row">
                    { /* Left side */}
                    <div class="col-md-6 text-white d-flex flex-column justify-content-center align-items-center">
                        <img
                            src={logo}
                            alt="MultiVendor"
                            style={{
                                height: "500px",
                                width: "1000px",
                                objectFit: "contain"
                            }} />
                    </div>

                    { /* Right side */}

                    <div class="col-md-6 d-flex justify-content-center align-items-center">
                        <RegisterForm />
                    </div>
                </div>
            </div>
        </div >
    );
}

export default Register;
