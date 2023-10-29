const Panels = () => {
  return (
    <>
      <div className="container text-center mt-4 p-2">
        <div className="row">
          <div className="col">
            <button className="btn btn-danger">New Budget</button>
          </div>
          <div className="col">
            <button className="btn btn-danger">All Budgets</button>
          </div>
          <div className="col">
            <button className="btn btn-danger">Submit Expenses</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Panels;
