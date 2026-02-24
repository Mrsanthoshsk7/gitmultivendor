import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import LoginForm from "../../components/auth/loginform";
// import Auth from "../../components/auth/auth";
function Login() {
    return (
        <div className="">
            <div class="container-fluid">
                <div class="row">

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


                    <div class="col-md-6 d-flex justify-content-center align-items-center bg-light">
                        <LoginForm />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
