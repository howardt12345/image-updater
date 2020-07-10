import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import { vars } from '@vars';

const { firebaseConfig, tinycc } = vars;
const proxyurl = "https://cors-anywhere.herokuapp.com/";

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();

const provider = new firebase.auth.GoogleAuthProvider();

const dev = true;

export const signInWithGoogle = () => {
  auth.signInWithPopup(provider);
};

export const signIn = async (email, pass) => {
  let error = '';
  await auth.signInWithEmailAndPassword(email, pass).catch(e => {
    error = e.message
  });
  return error;
}

export const signUp = async (email, pass) => {
  let error = '';
  await auth.createUserWithEmailAndPassword(email, pass).catch(e => {
    error = e.message
  });
  return error;
}

export const uploadFile = async (file, id, ext, hash, api, apiList) => {

  if(api !== -1) {
    const { apiKey, login } = tinycc[api];

    const testApi = await fetch((dev ? proxyurl : '') + `https://tiny.cc/?c=rest_api&m=get_requests_count&version=2.0.3&format=json&login=${login}&apiKey=${apiKey}`);

    const response = await testApi.json();

    apiList[api].count++;

    if(response.errorCode !== '0') {
      return false;
    } else {
      return await upload({
        file: file,
        id: id,
        ext: ext,
        hash: hash,
        api: api,
        apiKey: apiKey,
        login: login,
      }, apiList);
    }
  } else {
    if(!apiList) {
      return false;
    } else {
      let index = 0;
      let value = apiList[0].count < 0 ? 50 : apiList[0].count;
      for (let i = 1; i < apiList.length; i++) {
        if (apiList[i].count < value && apiList[i].count >= 0) {
          value = apiList[i].count;
          index = i;
        }
      }

      const { apiKey, login } = tinycc[index];

      console.log(`Using tinycc api #${index}`);

      return await upload({
        file: file,
        id: id,
        ext: ext,
        hash: hash,
        api: index,
        apiKey: apiKey,
        login: login,
      }, apiList);
    }
  }
}

const upload = async (props, apiList) => {

  const { file, id, ext, hash, api, apiKey, login } = props;

  const userId = auth.currentUser.uid;

  let result = false; 
  await storage.ref(`${userId}/${id}.${ext === 'jpg' ? 'jpeg' : ext}`).put(file).then(async () => {
    await storage.ref(`${userId}/${id}.${ext === 'jpg' ? 'jpeg' : ext}`).getDownloadURL().then(async (url) => {
      let responseData;

      if(hash) {
        const del = await fetch((dev ? proxyurl : '') + `https://tiny.cc/?c=rest_api&m=delete&version=2.0.3&format=json&login=${login}&apiKey=${apiKey}&hash=${hash}`);
        console.log(del);
        const response = await fetch((dev ? proxyurl : '') + `https://tiny.cc/?c=rest_api&m=shorten&version=2.0.3&format=json&shortUrl=${hash}&longUrl=${encodeURIComponent(url)}&login=${login}&apiKey=${apiKey}`);

        responseData = await response.json();

        apiList[api].count+=2;
      } else {
        const response = await fetch((dev ? proxyurl : '') + `https://tiny.cc/?c=rest_api&m=shorten&version=2.0.3&format=json&longUrl=${encodeURIComponent(url)}&login=${login}&apiKey=${apiKey}`);

        responseData = await response.json();

        apiList[api].count++;
      }

      console.log(responseData);

      if(responseData.errorCode === '0') {
        console.log('Shortlink successfully generated!')

        await firestore.collection(userId).doc(id).set({
          ext: ext === 'jpg' ? 'jpeg' : ext, 
          link: url, 
          shortlink: responseData.results.short_url ?? '',
          hash: hash ?? responseData.results.hash,
          api: api,
        })
        .then(function() {
          console.log("Document successfully written!");
        })
        .catch(function(error) {
          console.error("Error writing document: ", error);
        });

        result = true;
      } else {
        console.error('Shortlink failed to generate.');
        if(!hash) {
          console.log('Deleting uploaded photo.');
          await storage.ref(`${userId}/${id}.${ext === 'jpg' ? 'jpeg' : ext}`).delete().then(async () => {
            console.log(`deleted ${id} from storage`);
          });
        }
        result = false;
      }
    });
  });
  return result;
}

export const deleteFile = async (id, ext, hash, api, apiList) => {
  const userId = auth.currentUser.uid;
  const { apiKey, login } = tinycc[api];

  await storage.ref(`${userId}/${id}.${ext === 'jpg' ? 'jpeg' : ext}`).delete().then(async () => {
    console.log(`Deleted ${id} from storage`);
  });
  await firestore.collection(userId).doc(id).delete().then(() => {
    console.log(`Deleted ${id} from firestore`);
  });

  await fetch((dev ? proxyurl : '') + `https://tiny.cc/?c=rest_api&m=delete&version=2.0.3&format=json&login=${login}&apiKey=${apiKey}&hash=${hash}`).then(() => {
    console.log(`Deleted ${hash} from tinycc`);
  });
  apiList[api].count++;
}

export const tinyccApi = async () => {
  let tmp = [];
  for await (const api of tinycc) {
    const { apiKey, login } = api;

    const testApi = await fetch((dev ? proxyurl : '') + `https://tiny.cc/?c=rest_api&m=get_requests_count&version=2.0.3&format=json&login=${login}&apiKey=${apiKey}`);

    const response = await testApi.json();

    console.log(response);

    if(response.errorCode !== '0') {
      console.log({
        apiKey: apiKey,
        valid: false,
        count: -1,
      });
      tmp.push({
        valid: false,
        count: -1,
      });
    } else {
      console.log({
        apiKey: apiKey,
        valid: true,
        count: parseInt(response.results.count)
      });
      tmp.push({
        valid: true,
        count: parseInt(response.results.count)
      });
    }
  }

  return tmp;
}