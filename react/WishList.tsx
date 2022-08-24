import React, { useEffect } from 'react'
import axios from "axios";
import style from "./styleWishlist.css"
import InputMask from 'react-input-mask';

interface Idata {
  wishLists: IwishListUser[]
}

interface IwishListUser {
  email: string,
  id: any,
  listItemsWrapper: IwishListItemsWrapper[]
}

interface IwishListItemsWrapper {
  isPublic: boolean,
  listItems: IwishListItems[],
  name: string
}

interface IwishListItems {
  id: number,
  productId: string,
  sku: string,
  title: string
}

function WishList() {
  const [data, setData] = React.useState<Idata>()
  const [loading, setLoading] = React.useState(true)
  const [dataClient , setDataClient] = React.useState<any>(undefined)
  const [email , setEmail] = React.useState<any>(undefined)
  const [metrics, setMetrics] = React.useState<any>({
    total: 0,
    totalBought: 0
  })
  const [metricsPerClient, setMetricsPerClient] = React.useState<any>({
    totalNeverBoughtProducts: 0,
    totalBoughtProducts: 0
  })

  useEffect(() => {
    let totalMetrics = {
      total: 0,
      totalBought: 0
    };

    data?.wishLists.forEach((clientData: any) => {
      const clientEmail = clientData.email;
      const productList = clientData.listItemsWrapper[0].listItems;

      productList.forEach((product: any) => {
        const options = {
          method: 'GET',
          headers: {Accept: 'application/json', 'Content-Type': 'application/json'}
        };

        fetch(`/api/oms/pvt/orders?salesChannelId=1&per_page=50&orderBy=creationDate,desc&q=${clientEmail}&searchField=sku_Ids&sku_Ids=${product.sku}&f_creationDate=creationDate:[2022-05-01T02:00:00.000Z TO 2030-01-01T01:59:59.999Z]`, options)
          .then(response => response.json())
          .then(response => {
            totalMetrics ={
              total: totalMetrics.total + 1,
              totalBought: totalMetrics.totalBought + response.list.length
            }
            setMetrics(totalMetrics)
            setMetricsPerClient({
              totalNeverBoughtProducts: ((((response.list.length * 100 / productList.length) - 100) * -1) + metricsPerClient.totalNeverBoughtProducts ) / 2,
              totalBoughtProducts: ((response.list.length * 100 / productList.length)  + metricsPerClient.totalBoughtProducts ) / 2
            })
          })
          .catch(err => console.error(err));
        });
    })
  }, [data])

  let averageOfItens = 0
  let skuList: any = []


  const searchByEmail =  (email: string) => {
    data?.wishLists.map((item: any) => {
      if (item.email == email) setDataClient(item)
    })
  }

  const handleInput = ({ target: { value } }: any) => setEmail(value);


  React.useEffect(()=> {
    (async () => {
      const res =  await axios.get(
        `/_v/wishlist/export-lists`,
        {headers: {
          "Authorization": "vtexappkey-cellarvinhos-BYLWUX"
        }}
      );

      if (res.status !== 200) {
        console.log("ERROR", res);
      }
      setData(res.data)
      setLoading(false)
    })()

  }, [])

  data?.wishLists.forEach((item: IwishListUser) => {
    averageOfItens = averageOfItens + (item.listItemsWrapper[0].listItems.length / data.wishLists.length)

    item.listItemsWrapper[0].listItems?.forEach((item: IwishListItems) => {
      const newSkuList = skuList;
      const newSku = item.sku;

      newSkuList.push(newSku)
      skuList = newSkuList
    })
  })


    function countItems(arr: any) {
      const countMap = Object.create(null)

      for (const element of arr) {
        countMap[element] = (countMap[element] || 0) + 1
    }


    return Object.entries(countMap).map(([value, count]) => ({
      sku: value,
      quantidade: count,
    }))
  }

  const skuListOrganized = countItems(skuList);
  let skuMostCommun: any = skuListOrganized[0];


  skuListOrganized.forEach((item: any) => {
    if (item?.quantidade > skuMostCommun.quantidade) skuMostCommun = item;
  })

  const width = `${((metrics.totalBought * 100) / metrics.total).toFixed(2)}%`

  return (<>
  <div className={style.wishlistContainer}>
    <h3 className={style.wishlistTitle}>Wishlist</h3>
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
        </tr>
      ) : (
        <div className={style.wishlistContentContainer}>
          <div>
            <h3 className={style.titleConversaoTax}>Taxa de conversão</h3>

            <div className={style.percentageBar}>
              <div className={style.percentageBarInternal} style={{width: width}}/>
            </div>

            <p className={style.percentageNumber}>
              {((metrics.totalBought * 100) / metrics.total).toFixed(2)}%
            </p>
          </div>


          <p className={style.textInformations}>
            Produto mais favoritado: {skuMostCommun.sku}
          </p>
          <p className={style.textInformations}>
            Média de produtos na wishlist por cliente: {averageOfItens.toFixed(2)}
          </p>
        </div>
      )
    }

    <div className={style.wishlistContentContainer}>
      <div className={style.searchContainer}>
        <InputMask
          placeholder="Email"
          mask={""}
          onChange={handleInput}
          onKeyUp={(e: any) => {
            const key = e.which || e.keyCode;
            if (key == 13) searchByEmail(email)
          }}
        />
        <div className={style.searchIconContainer}>
          <div className={style.searchIcon} onClick={() => searchByEmail(email)}/>
        </div>
      </div>

      <div className={style.tableContainer}>
        <table>
          <thead>
              <tr>
                <td className={style.colSpacing}></td>
                <td className={style.tableProductCol}>Produto:</td>
                <td className={style.tableSkuCol}>Sku:</td>
                <td className={style.tableIdCol}>Id do produto:</td>
                <td className={style.colSpacing}></td>
              </tr>
          </thead>
          <tbody>
            {dataClient && dataClient.listItemsWrapper[0].listItems.map((item: IwishListItems, i: number) => {
              return (
                <tr key={i}>
                  <td className={style.colSpacing}></td>
                  <td className={style.tableProductCol}>{item.title}</td>
                  <td className={`${style.tableSkuCol}`}>{item.sku}</td>
                  <td className={`${style.tableIdCol}`}>{item.productId}</td>
                  <td className={style.colSpacing}></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  </>)
}

export default WishList
