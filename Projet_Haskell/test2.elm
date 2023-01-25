module ListeMots exposing(..)
import Html exposing (text,ul,li)
import String
import Random

type alias WordList = List String

words : WordList
words = String.split " " "a anywhere below burn climb able apartment bend bus close about appear beneath business clothes"

randomWord : WordList -> String
randomWord wordList =
    let
        randomIndex = Random.int 0 (List.length wordList - 1)
        wordListWithIndex = List.indexedMap (\index word -> (index, word)) wordList
        randomWordTuple = List.drop randomIndex wordListWithIndex |> List.head
    in
      div [] [ text words ]

main =
    ul [] [li [] [text (randomWord words)]]
