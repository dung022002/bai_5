const cheerio = require('cheerio')
const fs = require('fs')
const axios = require('axios')
const sharp = require('sharp')
const imageSize = require('image-size')


const URL = "https://www.flickr.com/search/?text=cat"

axios({
  url: URL,
}).then(async (res) => {
  let $ = cheerio.load(res.data);  //lay ra phan res cua 
  const arrOne = $('div.search-photos-results > div.search-photos-everyone-view > div.photo-list-view').children()
  // tao mang chua cac the con cua the div co class photo-list-view

  const arr = []
  arrOne.each((index, element) => {     // duyet qua tung the cua mang vua tao
    const link = $(element).find('div.photo-list-photo-container > img').attr('src')
    // lay link trong thuoc tinh src trong the img

    arr[index] = 'https:' + link      // tao mang chua cac link anh
  })




  if (!fs.existsSync('img')) {                   // kiem tra da ton tai thu muc de luu anh chua
    fs.mkdirSync('img')              // tao thu muc luu anh neu chua ton tai
  }
  const now = new Date()                          // tao moc thoi gian ban dau 
  for (const [index, iterator] of arr.entries()) {
    await axios({
      url: iterator,
      responseType: 'stream',
    }).then(
      response =>
        new Promise((resolve, reject) => {
          response.data
            .pipe(fs.createWriteStream('img/img' + index + '.jpg'))
            .on('close', () => {
              console.log('new', new Date() - now)   // tinh thoi gian thuc thi 1 lan lap
              resolve()
            })
            .on('error', e => reject(e));
        }),
    )
  }
  const testFolder = 'img'
  fs.readdir(testFolder, async (err, files) => {
    files.forEach(async file => {
      const dimension = imageSize('img/' + file)
      //console.log(dimension.width, dimension.height) 
      let options = { width: 150 }

      if (dimension.height > dimension.width) {             // so sanh chieu rong va cao cua anh
        options = { height: 150 }
      }

      try {
        const data = fs.readFileSync('img/' + file)     // doc file anh lay du lieu anh
        const outputBuffer = await sharp(data).resize(options).toBuffer()    // dua anh ve kich thuoc 150 
        fs.writeFileSync('img/' + file, outputBuffer)
        console.log('old', dimension.width, dimension.height)              // in ra kich thuoc ban dau
        const newDimension = imageSize('img/' + file)
        // in ra kich thuoc sau khi sua
        console.log('new', newDimension.width, newDimension.height)
      } catch (err) {
        console.log(err)
      }



      if (!fs.existsSync('img-b-w')) {                   // kiem tra da ton tai thu muc de luu anh chua
        fs.mkdirSync('img-b-w')              // tao thu muc luu anh neu chua ton tai
      }
      const dimension1 = imageSize('img/' + file)
      sharp('img/' + file)
        .greyscale() // make it greyscale
        .linear(1.5, 0) // increase the contrast
        .jpeg({ colors: 2 }) // reduce image to two colors
        .toFile('img-b-w/' + file)
    }
    )
  })
})



