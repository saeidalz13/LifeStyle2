import { Accordion } from "react-bootstrap";

export interface IAccordionItems {
  header: string;
  body: string;
}

interface DefaultAccordionProps {
  items: IAccordionItems[];
}

const DefaultAccordion = (props: DefaultAccordionProps) => {
  return (
    <Accordion>
      {props.items.map((item, idx) => (
        <Accordion.Item eventKey={`${idx}`}>
          <Accordion.Header className="custom-accordion-header">
            <span style={{ fontSize: "19px", fontWeight: "500" }}>
              {item.header}
            </span>
          </Accordion.Header>
          <Accordion.Body>{item.body}</Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

export default DefaultAccordion;
