const fs = require('fs');
const superagent = require('superagent');

//consuming promises
const readFilePromise = (file) => {
  //create a new file, in it we will pass a file name: 'file'
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject('I could not find that file');
      resolve(data); //value that promise return to us
    });
  });
};

const writeFilePromise = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject('Xould not write the file');
      resolve('success');
    });
  });
};

//////////////////////////////////////////
//async await
const getDogPic = async () => {
  try {
    const data = await readFilePromise(`${__dirname}/dog.txt`);
    console.log(`Breed: ${data}`);
    //symoultanious promises
    const res1Pro = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    const res2Pro = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    const res3Pro = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );

    const all = await Promise.all([res1Pro, res2Pro, res3Pro]);
    const imgs = all.map((el) => el.body.message);
    console.log(imgs);

    await writeFilePromise('dog-img.txt', imgs.join('\n')); // join 3 string into a new string

    //simple await promise
    // const res = await superagent.get(
    //   `https://dog.ceo/api/breed/${data}/images/random`
    // );

    // console.log(res.body.message);
    // await writeFilePromise('dog-img.txt', res.body.message);
    console.log('Random dog img saved to file');
  } catch (err) {
    console.log(err);
    throw err;
  }
  return '2: Ready';
};

(async () => {
  try {
    console.log('1:will get dog pics');
    const res = await getDogPic();
    console.log(res);
    console.log('3:done get dog pics');
  } catch (err) {
    console.log('ERROR');
  }
})();

// console.log('1:will get dog pics');
// getDogPic()
//   .then((x) => {
//     //.then is acces to its future value
//     console.log(x);
//     console.log('3:done get dog pics');
//   })
//   .catch((err) => {
//     console.log('ERROR');
//   });
//////////////////////////////////////////
// readFilePromise(`${__dirname}/dog.txt`)
//   .then((data) => {
//     console.log(`Breed: ${data}`);
//     return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
//   })
//   .then((res) => {
//     console.log(res.body.message);
//     return writeFilePromise('dog-img.txt', res.body.message);
//   })
//   .then(() => {
//     console.log('Random dopg img saved to file');
//   })
//   .catch((err) => {
//     console.log(err);
//   });
/////////////////////////////////////////
//promise get
// fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
//   console.log(`Breed: ${data}`);

//   superagent
//     .get(`https://dog.ceo/api/breed/${data}/images/random`)
//     .end((err, res) => {
//       if (err) return console.log(err.message);
//       console.log(res.body.message);

//       fs.writeFile('dog-img.txt', res.body.message, (err) => {
//         if (err) return console.log(err.message);
//         console.log('Random dopg img saved to file');
//       });
//     });
// });
//////////////////////////////////////////////
//promises consume
//implements the  concept of a future value that you wait to recieve in future

// fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
//   console.log(`Breed: ${data}`);

//   superagent
//     .get(`https://dog.ceo/api/breed/${data}/images/random`)
//     .then((res) => {
//       console.log(res.body.message);
//       fs.writeFile('dog-img.txt', res.body.message, (err) => {
//         if (err) return console.log(err.message);
//         console.log('Random dopg img saved to file');
//       });
//     })
//     .catch((err) => {
//       console.log(err.message);
//     });
// });
