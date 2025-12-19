
import { Link } from "react-router-dom";

export default function AddressCard({address, options})
{
  // country omitted to save space
  return (
    <div style={{display:"flex", flexDirection:"row", width:"100%", justifyContent:"space-between", alignItems:"center"}}>
      <span style={{textAlign:"left"}}>
        {`${address.street}`}<br/>
        {`${address.city} ${address.province} ${address.zip_code}`}
      </span>
      <Link className="btn" {...options}>Edit</Link>
    </div>
  );
}