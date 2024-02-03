import bcrypt from 'bcrypt';
import UserModel from '../model/User.model.js'
import jwt from 'jsonwebtoken'
// import ENV from '../config.js'
import otpGenerator from 'otp-generator'
import dotenv from 'dotenv';
dotenv.config()


/** middleware for verify user */
export async function verifyUser(req, res, next) {
    try {

        const { username } = req.method == "GET" ? req.query : req.body;

        // check the user existance
        let exist = await UserModel.findOne({ username });
        if (!exist) return res.status(404).send({ error: "Can't find User!" });
        next();

    } catch (error) {
        return res.status(404).send({ error: "Authentication Error" });
    }
}

/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/
export async function register(req, res) {

    try {
        const { username, password, profile, email } = req.body

        // check the user existance
        const existUsername = new Promise((resolve, reject) => {
            UserModel.findOne({ username }).then((err, user) => {
                if (err) reject(new Error(err))
                if (user) reject({ error: "Please use unique username" });

                resolve();
            }).catch(err => reject({ error: "exist username findone error" }));
        });

        // check for existing email
        const existEmail = new Promise((resolve, reject) => {
            UserModel.findOne({ email }).then((err, email) => {
                if (err) reject(new Error(err))
                if (email) reject({ error: "Please use unique email" });

                resolve();
            }).catch(err => reject({ error: "exist username findone error" }));
        });

        Promise.all([existUsername, existEmail])
            .then(() => {
                if (password) {
                    bcrypt.hash(password, 10)
                        .then(hashedPassword => {

                            const user = new UserModel({
                                username,
                                password: hashedPassword,
                                profile: profile || '',
                                email
                            });

                            // return save result as a response
                            user.save()
                                .then(result => res.status(201).send({ msg: "User Register Successfully" }))
                                .catch(error => res.status(500).send({ error }))

                        }).catch(error => {
                            return res.status(500).send({
                                error: "Enable to hashed password"
                            })
                        })
                }
            }).catch(error => {
                return res.status(500).send({ error })
            })

    } catch (error) {
        return res.status(500).send(error)
    }
}

/** POST: http://localhost:8080/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
export async function login(req, res) {
    const { username, password } = req.body

    try {
        UserModel.findOne({ username })
            .then(user => {
                bcrypt.compare(password, user.password)
                    .then(passwordCheck => {

                        if (!passwordCheck) return res.status(400).send({ error: "Password does not Match" });

                        // create jwt token
                        const token = jwt.sign({
                            userId: user._id,
                            username: user.username
                        }, process.env.JWT_SECRET, { expiresIn: "24h" });

                        return res.status(200).send({
                            msg: "Login Successful...!",
                            username: user.username,
                            token
                        });

                    })
                    .catch(error => {
                        return res.status(400).send({ error: "Password does not Match" })
                    })
            })
            .catch(error => {
                return res.status(404).send({ error: "Username not Found" });
            })
    } catch (error) {
        return res.status(500).send({ error });
    }
}

/** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req, res) {
    const { username } = req.params;


    try {
        if (!username) return res.status(400).send({ error: "Invalid Username" });

        const user = await UserModel.findOne({ username }).exec();

        const { password, ...rest } = Object.assign({}, user.toJSON());

        if (user) {
            return res.status(200).send(rest);
        } else {
            return res.status(404).send({ error: "User not found" });
        }
    } catch (error) {
        return res.status(500).send({ error: "Internal Server Error" });
    }
}

/** PUT: http://localhost:8080/api/updateuser 
 * @param: {
  "id" : "<userid>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function updateUser(req, res) {
    try {
        // const id = req.query.id;
        const { userId } = req.user

        if (!userId) {
            return res.status(401).send({ error: "User ID Not Provided...!" });
        }

        // Check if user with provided ID exists in the database
        const existingUser = await UserModel.findOne({ _id: userId });

        if (!existingUser) {
            return res.status(404).send({ error: "User not found." });
        }

        const body = req.body;

        // Update the data using promises
        const updatedData = await UserModel.updateOne({ _id: userId }, body);

        // Check if any documents were modified
        if (updatedData.modifiedCount > 0) {
        } else {
            return res.status(404).send({ error: "User not found." });
        }

        // Fetch the user after the update
        const updatedUser = await UserModel.findOne({ _id: userId });

        return res.status(201).send({ msg: "Record Updated...!" });
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
}


/** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req, res) {
    req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
    res.status(201).send({ code: req.app.locals.OTP })
}

/** GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req, res) {
    const { code } = req.query;
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
        req.app.locals.OTP = null; // reset the OTP value
        req.app.locals.resetSession = true; // start session for reset password
        return res.status(201).send({ msg: 'Verify Successsfully!' })
    }
    return res.status(400).send({ error: "Invalid OTP" });
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res) {
    if (req.app.locals.resetSession) {
        req.app.locals.resetSession = false;
        return res.status(201).send({ flag: req.app.locals.resetSession });
    }
    return res.status(440).send({ error: "Session expired!" })
}

// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
export async function resetPassword(req, res) {
    try {
        // Check if the reset session is expired
        if (!req.app.locals.resetSession) {
            return res.status(440).send({ error: "Session expired!" });
        }

        const { username, password } = req.body;

        try {
            // Find the user by username
            const user = await UserModel.findOne({ username });

            if (!user) {
                return res.status(404).send({ error: "Username not found" });
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Update the user's password
            await UserModel.updateOne({ username: user.username }, { password: hashedPassword });

            // Optionally reset the session
            req.app.locals.resetSession = false;

            return res.status(201).send({ msg: "Password reset successful!" });
        } catch (error) {
            return res.status(500).send({ error: "Unable to reset password" });
        }

    } catch (error) {
        return res.status(401).send({ error: "Unauthorized" });
    }
}