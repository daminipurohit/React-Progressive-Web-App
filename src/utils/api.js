import axios from 'axios';

const baseURL = 'https://api.github.com/'
const instance = axios.create({
    baseURL,
    responseType: 'json'
});
  
  export default instance; 
