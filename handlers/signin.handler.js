import jwt from 'jsonwebtoken';

// Secret for signing JWTs
const SECRET_KEY = process.env.JWT_KEY; 


const signInHandler = (req, res, bcrypt, db) => {
  db.select("email", "hash")
    .from("login")
    .where("email", "=", req.body.email)
    .then((data) => {
      console.log(data);
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {

        // Create a JWT token (expires in 1 hour)
        // const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        // return res.json({ token });


        db.select("*")
          .from("users")
          .where("email", "=", req.body.email)
          .then((user) => {

            const token = jwt.sign({ id: user[0].id, email: user[0].email }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ 
              user : user[0], 
              token : token 
            });
            //res.json(user[0]);
          })
          .catch((err) => res.status(400).json("unable to get user"));
      } else {
        res.status(400).json("wrong credentials");
      }
    })
    .catch((err) => res.status(400).json("wrong credentials"));
}

export default signInHandler;