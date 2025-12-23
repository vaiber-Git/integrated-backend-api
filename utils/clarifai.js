const returnClarifaiRequestOptions = (imageUrl) => {

  const PAT = '366df77dd6c4457e9e4d6704ccee832f';
  // Using the public Clarifai model
  const USER_ID = 'clarifai';       
  const APP_ID = 'main';

  const IMAGE_URL = imageUrl;

  const raw = JSON.stringify({
      "user_app_id": {
          "user_id": USER_ID,
          "app_id": APP_ID
      },
      "inputs": [
          {
              "data": {
                  "image": {
                      "url": IMAGE_URL
                  }
              }
          }
      ]
  });

  return {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Authorization': 'Key ' + PAT
      },
      body: raw
  };
}

const handleApiCall = (req, res) => {
  fetch("https://api.clarifai.com/v2/models/" + 'celebrity-face-detection' + "/outputs", returnClarifaiRequestOptions(req.body.input))
    .then(response => response.json())
    .then(data => {
      res.json(data);
    })
    .catch(err => res.status(400).json('unable to work with API'))
}

export default handleApiCall;