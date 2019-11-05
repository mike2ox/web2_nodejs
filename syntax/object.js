var member = ['mike2ox', 'baekjoon', 'egoing'];
console.log(member[1]);

//객체
var roles = {
  'programmer':'mike2ox',
  'designer' : 'baekjoon',
  'manager' : 'egoing'
};
console.log(roles.manager);

for(var name in roles){
  console.log('object => ', name, 'value =>', roles[name]);
}