module.exports = (temp, product) => {
  let output = temp.replaceAll(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replaceAll(/{%IMAGE%}/g, product.image);
  output = output.replaceAll(/{%QUANTITY%}/g, product.quantity);
  output = output.replaceAll(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replaceAll(/{%FROM%}/g, product.from);
  output = output.replaceAll(/{%PRICE%}/g, product.price);
  output = output.replaceAll(/{%DESCRIPTION%}/g, product.description);
  output = output.replaceAll(/{%ID%}/g, product.id);
  output = output.replaceAll(
    /{%NOT_ORGANIC%}/g,
    product.organic ? "" : "not-organic"
  );

  return output;
};
