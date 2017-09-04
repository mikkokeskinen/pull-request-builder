//
//
Function.prototype.$_ = function() 
{
   var self  = this
   var curry = function(fn, args)
   {
      return function()
      {
         console.log("=[ self ]=> ", self)
         var args1 = args.concat(Array.prototype.slice.call(arguments));
         return args1.length >= fn.length ? fn.apply(self, args1) : curry(fn, args1);
      };
   };
   return curry(self, [])
};
