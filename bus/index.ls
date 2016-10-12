# autocompile

require! { path, autoIndex }
  
export autoIndex do
  path.resolve(__dirname) + "/index.ls"
  new RegExp /js$/

