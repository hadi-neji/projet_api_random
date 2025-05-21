import axios from 'axios';
import dotenv from 'dotenv';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // à désactiver en prod
dotenv.config();

const headers = {
  'X-Api-Key': process.env.RANDOMMER_API_KEY
};

//  Utilisateur aléatoire (RandomUser)
const getUser = async () => {
  const { data } = await axios.get('https://randomuser.me/api/');
  const user = data.results[0];
  return {
    name: `${user.name.first} ${user.name.last}`,
    email: user.email,
    gender: user.gender,
    location: `${user.location.city}, ${user.location.country}`,
    picture: user.picture.large
  };
};

// Téléphone (Randommer.io)
const getPhone = async () => {
  const { data } = await axios.get('https://randommer.io/api/Phone/Generate?CountryCode=FR&Quantity=1', { headers });
  return data[0];
};

// IBAN (Randommer.io)
const getIBAN = async () => {
  const { data } = await axios.get('https://randommer.io/api/Finance/Iban/FR', { headers });
  return data;
};

// Carte bancaire (Randommer.io)
const getCreditCard = async () => {
  const { data } = await axios.get('https://randommer.io/api/Card?Quantity=1', { headers });

  return {
    cardNumber: data.cardNumber,
    cardType: data.type,
    expirationDate: data.date,
    cvv: data.cvv
  };
};

//  Nom aléatoire (Randommer.io)
const getRandomName = async () => {
  const { data } = await axios.get('https://randommer.io/api/Name?nameType=firstname&quantity=1', { headers });
  return data[0];
};

//  Animal (via dog.ceo)
const getPet = async () => {
  const { data } = await axios.get('https://dog.ceo/api/breeds/image/random');
  const imageUrl = data.message;
  const breed = imageUrl.split('/')[4].replace('-', ' ').replace('_', ' ');
  return breed.charAt(0).toUpperCase() + breed.slice(1);
};

// Citation (quotable.io)
const getQuote = async () => {
  const { data } = await axios.get('https://api.quotable.io/random');
  return {
    content: data.content,
    author: data.author
  };
};

// Blague (official-joke-api)
const getJoke = async () => {
  const { data } = await axios.get('https://official-joke-api.appspot.com/jokes/programming/random');
  return {
    type: data[0].type,
    content: `${data[0].setup} ${data[0].punchline}`
  };
};

// ✅ Pipeline d’agrégation
class Pipelines {
  constructor(app) {
    app.get('/api/profile', async (req, res) => {
      try {
        const [
          user,
          phoneNumber,
          iban,
          creditCard,
          randomName,
          pet,
          quote,
          joke
        ] = await Promise.all([
          getUser(),
          getPhone(),
          getIBAN(),
          getCreditCard(),
          getRandomName(),
          getPet(),
          getQuote(),
          getJoke()
        ]);

        const profile = {
          user,
          phoneNumber,
          iban,
          creditCard,
          randomName,
          pet,
          quote,
          joke
        };

        res.status(200).json(profile);
      } catch (err) {
        console.error('Erreur API :', err);
        res.status(500).json({
          error: err.response?.data || err.message || 'Erreur inconnue'
        });
      }
    });
  }
}

export default Pipelines;
