var M = {
  v:'v',
  f:function(){
    console.log(this.v);
  }
}

//약속(M객체를 mpart.js 밖에서도 쓸수 있게 함)
module.exports = M;