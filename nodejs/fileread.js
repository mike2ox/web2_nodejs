var fs = require('fs');

//utf-8로 인코딩
fs.readFile('sample.txt','utf-8', function(err, data){
  console.log(data);
});