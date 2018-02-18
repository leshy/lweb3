# autocompile
require! {
  path
  autoIndex
}
  
export autoIndex do
  __dirname
  ignore: new RegExp /js$/
