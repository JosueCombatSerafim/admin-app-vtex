import React from 'react'
import axios from "axios";
import style from "./style.css"

function Greeting() {
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)


React.useEffect(()=> {
  (async () => {
    const res =  await axios.get(
      `/m3service/abandoned-cart-sku/`
    );

    if (res.status !== 200) {
      console.log("ERROR", res);
    }
    setData(res.data)
    setLoading(false)
  })()
}, [])

function compare(a: any, b: any) {
  if (a.quantidade > b.quantidade)
     return -1;
  if (a.quantidade < b.quantidade)
    return 1;
  return 0;
}

data.sort(compare)


  return <div className={style.abandonedTaxContainer}>
    <h3 className={style.abandonedTaxTitle}>SKUs abandonados no carrinho</h3>

    <table className={style.abandonedTaxTable}>
      <tbody>
        <tr className={style.tableLineTop}>
          <td className={style.tableColTop}>
            SKU
          </td>
          <td  className={style.tableColTop}>
            QUANTIDADE
          </td>
        </tr>

        {
          loading ? (
            <tr>
              <td>
                <div className={style["lds-ellipsis"]}>
                  <div/>
                  <div/>
                  <div/>
                  <div/>
                </div>
              </td>
            </tr>) :
          (<>

        {data.map((item: any, key) => {
          return (
          <tr  key={key} className={style.tableLine}>
            <td  className={style.tableCol_01}>
            {item.numero}
            </td>
            <td  className={style.tableCol}>
            {item.quantidade}
            </td>

          </tr>
        )

          })}</>)
        }
      </tbody>
    </table>
  </div>
}

export default Greeting
