
import { Link } from "react-router-dom";

export default function PaymentCard({payment, options})
{
  // country omitted to save space
  return (
    <div style={{display:"flex", flexDirection:"row", width:"100%", justifyContent:"space-between", alignItems:"center"}}>
      <span style={{textAlign:"left"}}>
        {`${payment.type} **** ${payment.last4_digits} Expires ${payment.expiry_date}`}<br/>{`${payment.provider}`}
      </span>
      <Link className="btn" {...options}>Edit</Link>
    </div>
  );
}