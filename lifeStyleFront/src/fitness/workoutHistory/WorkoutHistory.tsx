// import {
//   Accordion,
//   Button,
//   Container,
//   Modal,
//   Row,
//   Table,
// } from "react-bootstrap";
// import { PlanRecord } from "../../assets/FitnessInterfaces";
// import rl from "../../svg/RotatingLoad.svg";
// import BACKEND_URL from "../../Config";
// import Urls from "../../Urls";
// import StatusCodes from "../../StatusCodes";
// import { ApiRes } from "../../assets/GeneralInterfaces";
// import { useState } from "react";
// // import ModalUpdatePlanRecord from "./ModalUpdatePlanRecord";

// const ModalWorkoutHistory = () => {
//   const handlePlanRecordRowClick = (moveRec: PlanRecord) => {
//     setSelectedMoveToUpdate(null);
//     setTimeout(() => setSelectedMoveToUpdate(moveRec), 0);
//     setUpdateRecModalShow(true);
//     return;
//   };

//   const [selectedMoveToUpdate, setSelectedMoveToUpdate] =
//     useState<PlanRecord | null>();
//   const [updateRecModalShow, setUpdateRecModalShow] = useState(false);

//   const handleUpdateHistory = async () => {
//     // setUpdatePossibleErrs("");

//     try {
//       const result = await fetch(
//         `${BACKEND_URL}${Urls.fitness.getPlanRecords}/${props.dayPlanId}`,
//         {
//           method: "GET",
//           credentials: "include",
//         }
//       );

//       // setLoadingUpdate(false);
//       if (result.status === StatusCodes.UnAuthorized) {
//         location.assign(Urls.login);
//         return;
//       }

//       if (result.status === StatusCodes.InternalServerError) {
//         // setUpdatePossibleErrs("Internal server error! Try again later");
//         setTimeout(() => {
//           //   setUpdatePossibleErrs("");
//         }, 5000);
//         return;
//       }

//       if (result.status === StatusCodes.Ok) {
//         // const data = (await result.json()) as PlanRecords;
//         // setPlanRecords(data);
//         // setUpdatePossibleSuccess("History Updated!");
//         setTimeout(() => {
//           //   setUpdatePossibleSuccess("");
//         }, 5000);
//         return;
//       }

//       //   setUpdatePossibleErrs("Something went wrong! Try again later");
//       setTimeout(() => {
//         // setUpdatePossibleErrs("");
//       }, 5000);
//       return;
//     } catch (error) {
//       console.log(error);
//       return "error";
//     }
//   };

//   const handleDeleteWeek = async (week: number) => {
//     try {
//       const result = await fetch(
//         `${BACKEND_URL}${Urls.fitness.deleteWeekPlanRecords}`,
//         {
//           method: "DELETE",
//           credentials: "include",
//           headers: {
//             Accept: "application/json",
//             "Content-Type": "application/json;charset=UTF-8",
//           },
//           body: JSON.stringify({
//             week: week,
//           }),
//         }
//       );

//       if (result.status === StatusCodes.InternalServerError) {
//         const data = (await result.json()) as ApiRes;
//         alert(data.message);
//         return;
//       }

//       if (result.status === StatusCodes.NoContent) {
//         // handleUpdateHistory();
//         return;
//       }

//       location.assign(Urls.login);
//       return;
//     } catch (error) {
//       alert(error);
//       return;
//     }};

//   return (
//     <>
//       <Container>
//         <div
//           className="text-center"
//           //   style={{
//           //     backgroundColor: "#212226",
//           //     margin: "auto",
//           //     maxWidth: "750px",
//           //   }}
//         >
//           {props.planRecords === "waiting" ? (
//             <div className="mt-5" style={{ textAlign: "center" }}>
//               <img
//                 className="bg-primary rounded p-2"
//                 src={rl}
//                 height="150px"
//                 width="150px"
//                 alt="Rotation"
//               />
//             </div>
//           ) : props.planRecords === "error" ? (
//             <div></div>
//           ) : props.planRecords.plan_records.length === 0 ? (
//             <div className="text-center mt-3">
//               <h3 className="text-danger">No History Of Workout Yet</h3>
//             </div>
//           ) : (
//             <Row className="mb-2">
//               <div className="text-center mt-2 mb-3">
//                 <h3 className="text-dark">History Of Workout</h3>
//               </div>
//               {Object.values(groupedPlanRecords).map(
//                 (planRecordsArray: PlanRecord[], index: number) => (
//                   <Accordion key={index}>
//                     <Accordion.Item eventKey={`${index}`}>
//                       <Accordion.Header>
//                         <span style={{ fontSize: "20px" }}>
//                           Week {planRecordsArray[0].week}
//                         </span>
//                       </Accordion.Header>
//                       <Accordion.Body>
//                         <p
//                           className="mb-1 text-secondary"
//                           style={{ fontSize: "15px", fontWeight: "500" }}
//                         >
//                           <u>Click on row to update or delete sets</u>
//                         </p>
//                         <Table
//                           striped
//                           hover
//                           key={planRecordsArray[0].plan_record_id}
//                         >
//                           <thead>
//                             <tr>
//                               <th className="text-primary">Move</th>
//                               <th className="text-info">Set</th>
//                               <th className="text-warning">Reps</th>
//                               <th className="text-danger">Weights</th>
//                             </tr>
//                           </thead>
//                           <tbody className="plan-records-table">
//                             {planRecordsArray.map((moveRec, moveIndex) => (
//                               <tr
//                                 key={moveIndex}
//                                 onClick={() =>
//                                   handlePlanRecordRowClick(moveRec)
//                                 }
//                               >
//                                 <td>{moveRec.move_name}</td>
//                                 <td>{moveRec.set_record}</td>
//                                 <td>{moveRec.reps}</td>
//                                 <td>{moveRec.weight}</td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </Table>
//                         <Button
//                           onClick={() =>
//                             handleDeleteWeek(planRecordsArray[0].week)
//                           }
//                           className="px-4"
//                           variant="danger"
//                         >
//                           Delete Week {planRecordsArray[0].week}
//                         </Button>
//                       </Accordion.Body>
//                     </Accordion.Item>
//                   </Accordion>
//                 )
//               )}
//             </Row>
//           )}
//         </div>
//       </Container>

//       {selectedMoveToUpdate && (
//         <ModalUpdatePlanRecord
//           updateRecModalShow={updateRecModalShow}
//           onHide={() => setUpdateRecModalShow(false)}
//           selectedMoveToUpdate={selectedMoveToUpdate}
//           onClose={handleUpdateHistory}
//         />
//       )}
//     </>
//   );
// };

// export default ModalWorkoutHistory;
