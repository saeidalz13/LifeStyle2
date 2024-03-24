import MainDivHeader from "../Headers/MainDivHeader";

interface InsideGenericDivProps {
  header: string;
  texts: string[];
}

const InsideGenericDiv = (props: InsideGenericDivProps) => {
  const style = {
    backgroundColor: "#2A2A2A",
    padding: "20px",
    borderRadius: "8px",
    color: "#FFEFD5",
  };

  return (
    <div style={style}>
      <MainDivHeader text={props.header} />
      {props.texts.map((t) => (
        <p>{t}</p>
      ))}
    </div>
  );
};

export default InsideGenericDiv;
