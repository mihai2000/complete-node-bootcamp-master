class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  ///BUILD QUERY
  //1A)Filtering
  filter() {
    //with '...' will include all the fields  out of the obj, and with '{}' will create new obj
    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    //1B)Advanced Filtering

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // {{domain_port}}/api/v1/tours?duration[gte]=5&difficulty=easy  => endpoint
    // {difficulty:'easy', duration:{$gte:5}} =>query i need
    // {difficulty:'easy', duration:{gte:5}} => query i get from endopoint
    // gte,gt, lte, lt => replace this ones with the $ in the beginning

    this.query = this.query.find(JSON.parse(queryStr));
    return this; //return the entire object
  }
  sort() {
    // 2) SORTING
    //sorting ascending from low to high
    //{{domain_port}}/api/v1/tours?sort=price
    //sorting descending from high to low  , by adding the  '-' before the query param
    //{{domain_port}}/api/v1/tours?sort=-price
    if (this.queryString.sort) {
      //for more sorting criteria,   adding more criteria to sort by a ',' between them
      const sortBy = this.queryString.sort.split(',').join(' '); //split the array of strings, and then join them together for sorting
      this.query = this.query.sort(sortBy);
    } else {
      //if no sorting made, given an default to show the latest ones created first (the newest ones)
      this.query = this.query.sort('-createdAt');
    }
    return this; //return the entire object
  }
  limitFields() {
    //3)Field Limiting
    //select only the fields in query, and return the result incluing these ones
    //{{domain_port}}/api/v1/tours?fields=name,duration,difficulty,price
    //remove only the fields in query, and return the all the fields excluding these ones
    //{{domain_port}}/api/v1/tours?fields=-name,duration
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join('');
      this.query = this.query.select(fields);
    } else {
      //excluding fields from response  the '-' exlcudes the '__v' field
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    //4)PAGINATION
    const page = this.queryString.page * 1 || 1; //converting to string, '|| 1' by default show page 1
    const limit = this.queryString.limit * 1 || 100; //default limit to 100 results
    //previous page * limit, if page 3, results starts from 21
    const skip = (page - 1) * limit;
    // {{domain_port}}/api/v1/tours?page=2&limit=10
    //page 1: 1-10 results per page,page2: 11-20, page3: 21-30
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
