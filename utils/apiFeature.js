class ApiFeature {
  constructor(query, queryString) {
    this.queryString = queryString;
    this.query = query;
  }

  filter() {
    const filterObj = ["page", "limit", "sort", "fields"];
    const queryObj = { ...this.queryString };
    filterObj.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    let { sort } = this.queryString;

    if (sort) {
      sort = sort.split(",").join(" ");
      this.query = this.query.find().sort(sort);
    } else {
      this.query = this.query.find().sort("_createdAt");
    }
    return this;
  }

  limitFields() {
    let { fields } = this.queryString;

    if (fields) {
      fields = fields.split(",").join(" ");
      this.query = this.query.find().select(fields);
    } else {
      this.query = this.query.find().select("-__v -passwordChangedAt");
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.find().skip(skip).limit(limit);

    return this;
  }
}

export default ApiFeature;
