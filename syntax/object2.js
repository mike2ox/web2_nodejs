//array object
//function은 다른 것들과 달리 값이 될수 있음
var f = function(){
  console.log(1+1);
  console.log(1+2);
}
//console.log(f);
//f();

var a = [f];
a[0]();

var o ={
  func:f
}
o.func();
