import React, { useState, useEffect, Suspense, use } from "react"

/*
 useフックを使用して非同期データを取得する
*/

// Before
// 以前は、データのフェッチやその他の非同期操作を行うためには複雑なロジックが必要だった。
// 例えば、useEffect と状態管理フックを組み合わせて使用する必要があった。

// After
// Suspense と use フックを使用することで、非同期データの取得を簡単に行うことができる。
// use フックは、非同期関数を受け取り、その関数が返す Promise の結果を返す。
// Suspense は、非同期データの取得中に表示するコンポーネントを指定するために使用する。

// Warning: 
// A component was suspended by an uncached promise. Creating promises inside a Client Component or hook is not yet supported, except via a Suspense-compatible library or framework.
// 修正するには、Promise のキャッシュをサポートするサスペンス機能を備えたライブラリまたはフレームワークから Promise を渡す必要があります。将来的には、レンダリング時の Promise のキャッシュを容易にする機能をリリースすルトのこと。
// react-queryやswrを使用することで解決できる。

/*
 ドキュメントメタデータの管理
*/

// Before
// 以前は、ドキュメントのメタデータを管理するために、Helmet などのライブラリを使用する必要があった。

// After
// <title> や <meta> タグを直接 React コンポーネント内で使用できるようになった。

const fetchJoke = async () => {
  const response = await fetch("https://api.chucknorris.io/jokes/random")
  if (!response.ok) {
    throw new Error("Network response was not ok")
  }
  return response.json()
}

const BeforeJokeComponent = () => {
  const [joke, setJoke] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchJoke()
        setJoke(data)
      } catch (error) {
        console.error(error)
      } finally {
        console.log("Data fetched")
      }
    }
    document.title = "Before Title"
    fetchData()
  }, []) 

  if (!joke) {
    return "loading..."
  }

  return (
    <div>
      <p>{joke.value}</p>
    </div>
  )
}

const AfterJokeComponent = () => {
  const joke = use(fetchJoke())
  
  return (
    <div>
      <title>After Title</title>
      <meta name="description" content="Example description" />
      <p>{joke ? joke.value : "No joke"}</p>
    </div>
  )
}

const Joke = () => {
  return (
    // <BeforeJokeComponent />
    <Suspense fallback={<div>Loading...</div>}>
      <AfterJokeComponent />
    </Suspense>
  )
}

export default Joke
