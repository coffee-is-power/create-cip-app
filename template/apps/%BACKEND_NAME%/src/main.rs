use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;

struct AppState {
  db: sqlx::PgPool,
}
#[get("/")]
async fn hello(state: web::Data<AppState>) -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

#[post("/echo")]
async fn echo(req_body: String) -> impl Responder {
    HttpResponse::Ok().body(req_body)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
  dotenv().ok();
  let pool = PgPoolOptions::new()
    .max_connections(10)
    .min_connections(2)
    .connect_lazy(&std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"))
    .unwrap();
  sqlx::migrate!().run(&pool).await.unwrap();
  HttpServer::new(move || {
    App::new()
      .app_data(web::Data::new(AppState { db: pool.clone() }))
      .service(echo)
      .service(hello)
  })
  .bind(("127.0.0.1", 3000))?
  .run()
  .await
}
