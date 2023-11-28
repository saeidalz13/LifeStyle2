import { Container, Row } from "react-bootstrap";
import BackHomeBtn from "./BackHomeBtn";
const About = () => {
  return (
    <>
      <BackHomeBtn />
      <Container className="mt-5 text-center">
        <Row>
          <h2>Our purpose:</h2>
          This website is about managing your money and health!
        </Row>
      </Container>
    </>
  );
};

export default About;
