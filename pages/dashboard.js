// import { useMemo } from "react"
// import Table from "../components/Table";

// const getData = () => [
//     {
//         name: "Jane Cooper",
//         email: "jane.cooper@example.com",
//         title: "Regional Paradigm Technician",
//         department: "Optimization",
//         status: "Active",
//         role: "Admin",
//         imgUrl:
//             "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
//     },
//     {
//         name: "Cody Fisher",
//         email: "cody.fisher@example.com",
//         title: "Product Directives Officer",
//         department: "Intranet",
//         status: "Active",
//         role: "Owner",
//         imgUrl:
//             "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
//     },
//     {
//         name: "Esther Howard",
//         email: "esther.howard@example.com",
//         title: "Forward Response Developer",
//         department: "Directives",
//         status: "Active",
//         role: "Member",
//         imgUrl:
//             "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
//     },
//     {
//         name: "Jenny Wilson",
//         email: "jenny.wilson@example.com",
//         title: "Central Security Manager",
//         department: "Program",
//         status: "Active",
//         role: "Member",
//         imgUrl:
//             "https://images.unsplash.com/photo-1498551172505-8ee7ad69f235?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
//     },
//     {
//         name: "Kristin Watson",
//         email: "kristin.watson@example.com",
//         title: "Lean Implementation Liaison",
//         department: "Mobility",
//         status: "Active",
//         role: "Admin",
//         imgUrl:
//             "https://images.unsplash.com/photo-1532417344469-368f9ae6d187?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
//     },
//     {
//         name: "Cameron Williamson",
//         email: "cameron.williamson@example.com",
//         title: "Internal Applications Engineer",
//         department: "Security",
//         status: "Active",
//         role: "Member",
//         imgUrl:
//             "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
//     },
// ];


// export default function Dashboard() {
//     const columns = useMemo(
//         () => [
//             {
//                 Header: "Name",
//                 accessor: "name",
//             },
//             {
//                 Header: "Title",
//                 accessor: "title",
//             },
//             {
//                 Header: "Status",
//                 accessor: "status",
//             },
//             {
//                 Header: "Role",
//                 accessor: "role",
//             },
//         ],
//         []
//     );

//     const data = useMemo(() => getData(), []);

//     return (
//         <>
//             <h1>Hello React!</h1>
//             <div>
//                 <Table columns={columns} data={data} />
//             </div>
//         </>
//     );
// }

export default function Dashboard() {
    return (
        <>
            <div className="py-6 md:py-12 bg-blue-900">
                <h1 className="text-center max-w-2xl w-full md:w-4/12 mx-auto mt-4 text-3xl md:text-4xl text-white font-medium py-2 mb-8"> DASHBOARD </h1>
            </div>
        </>
    )
}