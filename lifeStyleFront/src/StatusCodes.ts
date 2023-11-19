class StatusCodes {
  Ok = 200;
  Accepted = 202;
  Created = 201;
  NoContent = 204;

  Found = 302;

  BadRequest = 400;
  UnAuthorized = 401;
  Forbidden = 403;
  NotFound = 404;

  InternalServerError = 500;
}

export default new StatusCodes();
