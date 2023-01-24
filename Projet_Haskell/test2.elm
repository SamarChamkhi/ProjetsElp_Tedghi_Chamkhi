import Html exposing (text,ul,li)
import String
import Random
import List

type alias WordList = List String

words : WordList
words = String.split " " " group image lot drive"

main =
    let
        randomIndex = Random.int 0 (List.length words - 1)
        randomWord = List.headAt randomIndex words
    in
        ul [] (List.map (\word -> li [] [text word]) words)
