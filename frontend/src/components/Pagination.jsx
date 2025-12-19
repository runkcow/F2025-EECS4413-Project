
export default function Pagination({page, onChangePage, totalPages})
{
  let range = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++)
  {
    range.push(i);
  }

  const handleOnClick = (n) => {
    if (n > 0 && n <= totalPages && n !== page)
    {
      onChangePage(n);
    }
  };

  return (
    <div className="pagination">
      <div>
        <button type="button" className="btn" style={{borderRadius:"8px 0px 0px 8px"}} onClick={() => handleOnClick(page - 1)}>Prev</button>
        {range.map((a) => (
          a === page ? (<button type="button" className="btn" key={a} style={{borderRadius:"0px", border:"1px solid", borderColor:"#ffae00"}}>{a}</button>)
          : (<button type="button" className="btn" key={a} style={{borderRadius:"0px"}} onClick={() => handleOnClick(a)}>{a}</button>)
        ))}
        <button type="button" className="btn" style={{borderRadius:"0px 8px 8px 0px"}} onClick={() => handleOnClick(page + 1)}>Next</button>
      </div>
    </div>
  )
}