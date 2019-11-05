console.log('Hello no daemon')
//pm2 start [filename] --ignore-watch="path" <-- PM2가 재시작 안하도록 해줌.
var http = require('http');
var fs = require('fs');
var url =require('url');//'url' module을 요구
var qs = require('querystring');
var template = require('./lib/template')
var path = require('path') // 보안
var sanitizeHtml = require('sanitize-html');  //script 태그가 있으면 걸러줌

//웹 서버를 만드는 역할을 함
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathName = url.parse(_url, true).pathname;
    //console.log(pathName);
    //console.log(queryData.id);
    /*
    if(_url == '/'){
      title = 'Welcome';
      //_url = '/index.html';
    }
    if(_url == '/favicon.ico'){
      response.writeHead(404);
      response.end();
      return;
    }*/
    //console.log(__dirname + _url);
    //사용자에게 전달하는 데이터가 바뀜.(파일 경로가 바뀜)
    //response.end(fs.readFileSync(__dirname+_url));

    if(pathName === '/'){
      //정의된 값이 아닐때
      if(queryData.id === undefined){
        fs.readdir('./data/', function(err, filelist){
          //console.log(filelist);
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.list(filelist);
          var html = template.html(title, list, `<h2>${title}</h2>${description}`,'');
          response.writeHead(200);
          response.end(html);
        });
      } else {
        fs.readdir('./data',function(err, filelist){
          var vilteredId = path.parse(queryData.id).base;
          //외부로부터 입력 받을수 있는 부분을 검사
          fs.readFile(`data/${vilteredId}`, 'utf-8', function(err,description){
            var title = queryData.id;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
              allowedTags:['h1']
            });
            var list = template.list(filelist);
            //delete도 post로 전해줘야함. 
            var html =  template.html(sanitizedTitle, list, 
              `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
              ` <a href="/update?id=${sanitizedTitle}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`);
            response.writeHead(200);
            response.end(html);
          });
        });
      }
    } else if (pathName==='/create'){
      fs.readdir('./data/', function(err, filelist){
        //console.log(filelist);
        var title = 'WEB - create';
        var list = template.list(filelist);
        var html = template.html(title, list, `
          <form action="/create_process" method="post">
            <p><input type='text' name='title' placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description" cols="30" rows="10"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, '');
        response.writeHead(200);
        response.end(html);
      });
    } else if(pathName ==='/create_process'){ //post로 보낸 form을 받는 구간
      var body = '';
      //특정한 양의 조각을 수신할때 마다 
      request.on('data', function(data){
        body += data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        //console.log(post.title);
        //갖고온 post 정보들을 파일생성/저장
        fs.writeFile(`data/${title}`, description, 'utf-8', function(err) {
          //성공 : 200, 리다이렉션 : 302
          //response.writeHead(200);
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end('success');
        })
      });
    } else if(pathName ==='/update'){
      fs.readdir('./data',function(err, filelist){
        var vilteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${vilteredId}`, 'utf-8', function(err,description){
          var title = queryData.id;
          var sanitizedTitle = sanitizeHtml(title);
          var sanitizedDescription = sanitizeHtml(description);
          var list = template.list(filelist);
          var html =  template.html(sanitizedTitle, list, 
          `<form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type='text' name='title' placeholder="title" value="${title}"></p>
            <p>
              <textarea name="description" placeholder="description" cols="30" rows="10">${description}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>`,
          `<a href="/update?id=${title}">update</a>`);
          response.writeHead(200);
          response.end(html);
        });
      });
    } else if(pathName==='/update_process') {
      var body = '';
      //특정한 양의 조각을 수신할때 마다 
      request.on('data', function(data){
        body += data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${post.id}`, `data/${title}`, function(err){
          fs.writeFile(`data/${title}`, description, `utf-8`, function(err){
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          })
        })
      });
    } else if(pathName==='/delete_process') {
      var body = '';
      //특정한 양의 조각을 수신할때 마다 
      request.on('data', function(data){
        body += data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var vilteredId = path.parse(id).base;
        fs.unlink(`data/${vilteredId}`, function(err){
          response.writeHead(302, {Location: `/`});
          response.end();
        })
      });
    } else {
      response.writeHead(404);
      response.end('Not Found');
    }
});
app.listen(3000); //3000포트에서 HTTP서버를 구동시킴. 