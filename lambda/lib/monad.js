//
// derived from 
//   https://github.com/fogfish/monad.js


//
// @see 
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
module.exports.curry = function(fn){return fn.curry()};
module.exports.$_  = function(fn){return fn.curry()};
module.exports.do  = function()
{
   if (arguments.length == 0)
   {
      return Promise.resolve(true)
   } else {
      var list = arguments[0]
      var head = list.shift()
      return list.reduce(function(acc, x){return acc.bind(x)}, head)
   }
}
module.exports.fold  = function(headM, tail)
{
   var head = tail.shift()
   return tail.reduce(function(acc, x){return acc.bind(x)}, headM.bind(function(_){return head}))
}

//
//
module.exports.liftM0 = function(fn)
{
   return function(x)
   {
      fn.apply(this, [])
      return x
   }
}

module.exports.liftM1 = function(fn)
{
   return function(x)
   {
      fn.apply(this, [x])
      return x
   }
}

//
// 
module.exports.IO = function(value)
{
   if (!!(value && value.constructor && value.call && value.apply)) 
   {
      return new Promise(
         function(accept, reject)
         {
            value(function(x){return accept(x);}, function(x){return reject(x)})
         }
      )
   } else {
      return Promise.resolve(value)
   }
};
Promise.prototype.bind = Promise.prototype.then
Promise.prototype.fail = Promise.prototype.catch

