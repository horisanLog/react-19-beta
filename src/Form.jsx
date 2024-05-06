import React, { useState, useActionState, useOptimistic } from "react"

/*
  useActionState
*/

// Before
// 以前は、非同期操作を行うためには、状態管理フックと非同期関数を組み合わせて使用する必要があった。
// 例えば、useState フックを使用して状態を管理し、非同期関数を呼び出すことでデータを取得する。
// この場合、非同期操作の状態を管理するために、ローディング中やエラー時の状態を追加する必要があった。

// After
// useActionState フックを使用することで、非同期操作を簡単に行うことができる。
// useActionState フックは、非同期関数を受け取り、その関数が返す Promise の結果を返す。
// また、非同期操作の状態を管理するためのローディング中やエラー時の状態も自動的に追加される。

/*
  formの<action>属性の使用
*/

// Before
// 以前は、フォームを送信する際には、JavaScript を使用してイベントハンドラを設定する必要があった。
// 例えば、フォームの送信時にイベントハンドラを設定し、フォームデータを取得してサーバーに送信する。
// e.preventDefault() でデフォルトのイベントをキャンセルしている。
// この場合、フォームデータの取得やサーバーへの送信処理を手動で記述する必要があった。

// After
// <form> 要素の action 属性を使用することで、フォームの送信処理を簡単に行うことができる。
// また、フォームデータの取得やサーバーへの送信処理は、ブラウザが自動的に行うため、手動で処理を記述する必要がない。

/*
  useOptimistic
*/

// Before
// 以前は、オプティミスティックUIを実装するためには、状態管理フックと条件分岐を組み合わせて使用する必要があった。
// 例えば、非同期操作の開始時にローディング中の状態を設定し、非同期操作が成功した場合にデータを表示する。

// After
// useOptimistic フックを使用することで、ユーザーの操作に対する応答として即座にUIを更新し、バックエンドの処理完了を待たずにユーザーにフィードバックを提供することができる。

const BeforeFormComponent = () => {
  const [input, setInput] = useState("")
  const [post, setPost] = useState(null)
  const [isLoading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const title = formData.get("title")
    const body = formData.get("body")
    const userId = 1
    setLoading(true)

    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify({ title, body, userId }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })

    const data = await response.json()
    setPost(data)
    setLoading(false)
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write something..."
        />
        <button type="submit" disabled={isLoading}>
          Submit Post
        </button>
      </form>
      {isLoading && <p>Loading...</p>}
      {post && (
        <div>
          <h3>Response</h3>
          <p>Title: {post.title}</p>
          <p>Body: {post.body}</p>
          <p>User ID: {post.userId}</p>
          <p>ID: {post.id}</p>
        </div>
      )}
    </div>
  )
}

const createPost = async (previousState, formData) => {
  // console.log(previousState) //  前の状態を確認することができる { status: "idle", message: "" }

  const body = Object.fromEntries(formData.entries())
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts",
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    )
    const data = await response.json()
    return {
      status: "success",
      message: "Post submitted successfully",
      post: data,
    }
  } catch (error) {
    // バックエンドの更新が失敗したらUIを元に戻す
    console.error(error)
  }
}

const AfterFormComponent = () => {
  const [optimistic, optimisticUpdater] = useOptimistic()
  const [postState, handlePost, isPending] = useActionState(createPost, {
    status: "idle",
    message: "",
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.target) // 本来だとuseStateを使っていたinputの値を取得する方がケースとしては多い
    handlePost(formData)
  }

  const handleFormAction = async (formData) => {
    // e.preventDefault()が不要になる
    optimisticUpdater(() => {
      return { status: "pending" }
    })

    const data = Object.fromEntries(formData.entries())
    return await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Title" required />
        <textarea name="body" placeholder="Body" required></textarea>
        <button type="submit" disabled={isPending}>
          Submit Post
        </button>
        {isPending && <p>Loading...</p>}
        {postState.status === "success" && <p>{postState.message}</p>}
        {postState.post && (
          <div>
            <p>Title: {postState.post.title}</p>
            <p>Body: {postState.post.body}</p>
          </div>
        )}
      </form>
      <form action={handleFormAction}>
        {optimistic && optimistic.status === "pending" && <p>Loading...</p>}
        <input name="username" />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

const Form = () => {
  return (
    // <BeforeFormComponent />
    <AfterFormComponent />
  )
}

export default Form
